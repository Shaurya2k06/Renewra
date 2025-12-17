/**
 * Error Handler Utilities
 * Centralized error handling and user-friendly error messages
 */

import { toast } from 'sonner';

export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

// Error codes
export const ErrorCodes = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PROGRAM_ERROR: 'PROGRAM_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  FUND_PAUSED: 'FUND_PAUSED',
};

// User-friendly error messages
const errorMessages = {
  [ErrorCodes.WALLET_NOT_CONNECTED]: 
    'Please connect your wallet to continue.',
  [ErrorCodes.INSUFFICIENT_BALANCE]: 
    'Insufficient balance. Please add funds to your wallet.',
  [ErrorCodes.TRANSACTION_FAILED]: 
    'Transaction failed. Please try again.',
  [ErrorCodes.NETWORK_ERROR]: 
    'Network error. Please check your connection and try again.',
  [ErrorCodes.INVALID_AMOUNT]: 
    'Invalid amount. Please enter a valid number.',
  [ErrorCodes.USER_REJECTED]: 
    'Transaction was rejected. Please approve the transaction to continue.',
  [ErrorCodes.ACCOUNT_NOT_FOUND]: 
    'Account not found. Please create a token account first.',
  [ErrorCodes.FUND_PAUSED]: 
    'The fund is currently paused. Please try again later.',
};

/**
 * Parse Solana transaction error
 */
export function parseSolanaError(error) {
  const errorString = error?.message || error?.toString() || '';
  const logs = error?.logs || [];

  // User rejected transaction
  if (errorString.includes('User rejected')) {
    return new AppError(
      errorMessages[ErrorCodes.USER_REJECTED],
      ErrorCodes.USER_REJECTED
    );
  }

  // Insufficient SOL for fees
  if (errorString.includes('insufficient funds') || 
      errorString.includes('insufficient lamports')) {
    return new AppError(
      'Insufficient SOL for transaction fees. Please add SOL to your wallet.',
      ErrorCodes.INSUFFICIENT_BALANCE
    );
  }

  // Insufficient token balance
  if (logs.some(log => log.includes('insufficient funds'))) {
    return new AppError(
      'Insufficient token balance.',
      ErrorCodes.INSUFFICIENT_BALANCE
    );
  }

  // Fund paused
  if (logs.some(log => log.includes('FundPaused'))) {
    return new AppError(
      errorMessages[ErrorCodes.FUND_PAUSED],
      ErrorCodes.FUND_PAUSED
    );
  }

  // Account not initialized
  if (logs.some(log => log.includes('AccountNotInitialized'))) {
    return new AppError(
      'Required account not initialized. Please contact support.',
      ErrorCodes.ACCOUNT_NOT_FOUND,
      { logs }
    );
  }

  // Invalid NAV
  if (logs.some(log => log.includes('InvalidNavPrice'))) {
    return new AppError(
      'NAV price is invalid. Please try again later.',
      ErrorCodes.PROGRAM_ERROR
    );
  }

  // Network/RPC errors
  if (errorString.includes('429') || errorString.includes('rate limit')) {
    return new AppError(
      'Too many requests. Please wait a moment and try again.',
      ErrorCodes.NETWORK_ERROR
    );
  }

  if (errorString.includes('timeout') || errorString.includes('timed out')) {
    return new AppError(
      'Transaction timed out. Please check your connection and try again.',
      ErrorCodes.NETWORK_ERROR
    );
  }

  // Generic program error
  if (logs.length > 0) {
    return new AppError(
      'Transaction failed. Please try again or contact support.',
      ErrorCodes.PROGRAM_ERROR,
      { logs }
    );
  }

  // Default error
  return new AppError(
    errorMessages[ErrorCodes.TRANSACTION_FAILED],
    ErrorCodes.TRANSACTION_FAILED,
    { originalError: errorString }
  );
}

/**
 * Handle and display error to user
 */
export function handleError(error, customMessage) {
  console.error('Error occurred:', error);

  let appError;
  if (error instanceof AppError) {
    appError = error;
  } else {
    appError = parseSolanaError(error);
  }

  // Display toast notification
  toast.error(customMessage || appError.message, {
    duration: 5000,
    action: appError.code === ErrorCodes.INSUFFICIENT_BALANCE ? {
      label: 'Get SOL',
      onClick: () => window.open('https://faucet.solana.com', '_blank'),
    } : undefined,
  });

  // Log to monitoring service in production
  if (import.meta.env.PROD) {
    logErrorToService(appError);
  }

  return appError;
}

/**
 * Log error to monitoring service (Sentry, etc.)
 */
function logErrorToService(error) {
  // TODO: Integrate with Sentry or other monitoring service
  // Example:
  // Sentry.captureException(error, {
  //   extra: error.details,
  //   tags: { code: error.code }
  // });
}

/**
 * Validate transaction before submission
 */
export function validateTransaction(type, params) {
  const { amount, balance, min, max } = params;

  if (!amount || amount <= 0) {
    throw new AppError(
      'Please enter a valid amount greater than 0.',
      ErrorCodes.INVALID_AMOUNT
    );
  }

  if (min && amount < min) {
    throw new AppError(
      `Minimum ${type} amount is ${min} USDC.`,
      ErrorCodes.INVALID_AMOUNT
    );
  }

  if (max && amount > max) {
    throw new AppError(
      `Maximum ${type} amount is ${max} USDC.`,
      ErrorCodes.INVALID_AMOUNT
    );
  }

  if (balance && amount > balance) {
    throw new AppError(
      `Insufficient balance. You have ${balance.toFixed(2)} but tried to ${type} ${amount}.`,
      ErrorCodes.INSUFFICIENT_BALANCE
    );
  }
}

export default {
  AppError,
  ErrorCodes,
  handleError,
  parseSolanaError,
  validateTransaction,
};
