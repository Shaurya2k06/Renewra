/**
 * Solana RPC helper functions for Renewra
 * Handles all blockchain interactions, account decoding, and transaction building
 */

import { Connection, PublicKey, TransactionInstruction, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// ============================================================================
// Environment Configuration
// ============================================================================

export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || '5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z'
);
export const RPC_URL = import.meta.env.VITE_DEVNET_RPC || 'https://api.devnet.solana.com';

// Devnet USDC - Circle's official devnet USDC
export const USDC_MINT = new PublicKey(
  import.meta.env.VITE_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
);
export const GOVERNANCE_PDA = new PublicKey(
  import.meta.env.VITE_GOVERNANCE_PDA || 'ELZEwTd7oaHaYmT9BrcweRv4xEJYp9vR4ceskJKteqSG'
);
export const NAV_ORACLE_PDA = new PublicKey(
  import.meta.env.VITE_NAV_ORACLE_PDA || 'BykxytfhUMsrrkDKQMrHhXFKGJD79CPWYgTqpkiXkxof'
);
export const REDEMPTION_QUEUE_PDA = new PublicKey(
  import.meta.env.VITE_REDEMPTION_QUEUE_PDA || 'BMuoAzAcMjzeH2NAee3qU9kGYu9Aao6wk5Me5VKuXD5o'
);

// PDA Seeds
const GOVERNANCE_SEED = 'governance';
const NAV_ORACLE_SEED = 'nav_oracle';
const TREASURY_SEED = 'treasury';
const REIT_MINT_SEED = 'reit_mint';

// Anchor discriminators (sha256("global:<instruction_name>")[0:8])
export const DISCRIMINATORS = {
  subscribe: Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]),
  requestRedeem: Buffer.from([105, 49, 44, 38, 207, 241, 33, 173]),
};

// ============================================================================
// Connection Management with Caching
// ============================================================================

let connectionInstance = null;

// Simple cache to avoid hammering the RPC
const requestCache = {
  data: {},
  timestamps: {},
  TTL: 30000, // 30 second cache TTL
};

/**
 * Get cached data or null if expired/missing
 */
function getCached(key) {
  const timestamp = requestCache.timestamps[key];
  if (timestamp && Date.now() - timestamp < requestCache.TTL) {
    return requestCache.data[key];
  }
  return null;
}

/**
 * Set cache data
 */
function setCache(key, value) {
  requestCache.data[key] = value;
  requestCache.timestamps[key] = Date.now();
}

/**
 * Clear all cached data
 */
export function clearCache() {
  requestCache.data = {};
  requestCache.timestamps = {};
}

/**
 * Get singleton Solana connection instance
 * @returns {Connection}
 */
export function getConnection() {
  if (!connectionInstance) {
    connectionInstance = new Connection(RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
  }
  return connectionInstance;
}

// ============================================================================
// PDA Derivation
// ============================================================================

/**
 * Derive the Treasury PDA (holds USDC)
 * @returns {[PublicKey, number]}
 */
export function deriveTreasuryPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TREASURY_SEED)],
    PROGRAM_ID
  );
}

/**
 * Derive the REI Token Mint PDA
 * @returns {[PublicKey, number]}
 */
export function deriveReitMintPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(REIT_MINT_SEED)],
    PROGRAM_ID
  );
}

// ============================================================================
// Account Decoding
// ============================================================================

/**
 * Decode NavOracle account data
 * Layout: 8 (discriminator) + 8 (latest_nav) + 8 (previous_nav) + 8 (timestamp) + 1 (bump)
 * @param {Buffer} data - Raw account data
 * @returns {{latestNav: number, previousNav: number, timestamp: number, bump: number}}
 */
export function decodeNavOracle(data) {
  if (!data || data.length < 33) {
    throw new Error('Invalid NavOracle data');
  }
  
  const view = new DataView(data.buffer, data.byteOffset);
  
  return {
    latestNav: Number(view.getBigUint64(8, true)),
    previousNav: Number(view.getBigUint64(16, true)),
    timestamp: Number(view.getBigInt64(24, true)),
    bump: data[32],
  };
}

/**
 * Decode Governance account data
 * Layout: 8 + 32 (admin) + 32 (oracle) + 2 + 2 + 2 + 1 + 1
 * @param {Buffer} data - Raw account data
 * @returns {Object}
 */
export function decodeGovernance(data) {
  if (!data || data.length < 80) {
    throw new Error('Invalid Governance data');
  }
  
  const view = new DataView(data.buffer, data.byteOffset);
  
  return {
    adminKey: new PublicKey(data.slice(8, 40)),
    oracleSigner: new PublicKey(data.slice(40, 72)),
    managementFeeBps: view.getUint16(72, true),
    mintFeeBps: view.getUint16(74, true),
    redemptionFeeBps: view.getUint16(76, true),
    paused: data[78] === 1,
    bump: data[79],
  };
}

/**
 * Decode RedemptionQueue account data
 * Layout: 8 (discriminator) + 4 (vec length) + N * RedemptionRequest + 1 (bump)
 * RedemptionRequest: 32 (requester) + 8 (amount) + 8 (timestamp) + 1 (status) = 49 bytes
 * @param {Buffer} data - Raw account data
 * @returns {{requests: Array, bump: number}}
 */
export function decodeRedemptionQueue(data) {
  if (!data || data.length < 13) {
    throw new Error('Invalid RedemptionQueue data');
  }
  
  const view = new DataView(data.buffer, data.byteOffset);
  const vecLength = view.getUint32(8, true);
  
  const requests = [];
  let offset = 12;
  
  for (let i = 0; i < vecLength && offset + 49 <= data.length; i++) {
    const requester = new PublicKey(data.slice(offset, offset + 32));
    const tokenAmount = Number(view.getBigUint64(offset + 32, true));
    const requestedAt = Number(view.getBigInt64(offset + 40, true));
    const status = data[offset + 48];
    
    requests.push({
      requester: requester.toBase58(),
      tokenAmount,
      requestedAt: requestedAt * 1000, // Convert to ms
      status: ['pending', 'approved', 'settled'][status] || 'unknown',
    });
    
    offset += 49;
  }
  
  return {
    requests,
    bump: data[data.length - 1],
  };
}

// ============================================================================
// On-Chain Data Fetching (with caching)
// ============================================================================

/**
 * Fetch current NAV from on-chain oracle
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<{navCents: number, previousNavCents: number, timestamp: Date}>}
 */
export async function fetchCurrentNav(forceRefresh = false) {
  const cacheKey = 'nav';
  
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }
  
  const connection = getConnection();
  
  try {
    const accountInfo = await connection.getAccountInfo(NAV_ORACLE_PDA);
    
    if (!accountInfo) {
      console.warn('NavOracle account not found, using default');
      const defaultVal = { navCents: 5000, previousNavCents: 5000, timestamp: new Date() };
      setCache(cacheKey, defaultVal);
      return defaultVal;
    }
    
    const decoded = decodeNavOracle(accountInfo.data);
    
    const result = {
      navCents: decoded.latestNav,
      previousNavCents: decoded.previousNav,
      timestamp: new Date(decoded.timestamp * 1000),
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching NAV:', error);
    const defaultVal = { navCents: 5000, previousNavCents: 5000, timestamp: new Date() };
    return defaultVal;
  }
}

/**
 * Fetch governance parameters
 * @param {boolean} forceRefresh - Skip cache
 * @returns {Promise<Object>}
 */
export async function fetchGovernance(forceRefresh = false) {
  const cacheKey = 'governance';
  
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }
  
  const connection = getConnection();
  
  try {
    const accountInfo = await connection.getAccountInfo(GOVERNANCE_PDA);
    
    if (!accountInfo) {
      return null;
    }
    
    const result = decodeGovernance(accountInfo.data);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching governance:', error);
    return null;
  }
}

/**
 * Fetch redemption queue
 * @param {boolean} forceRefresh - Skip cache
 * @returns {Promise<Array>}
 */
export async function fetchRedemptionQueue(forceRefresh = false) {
  const cacheKey = 'redemptionQueue';
  
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }
  
  const connection = getConnection();
  
  try {
    const accountInfo = await connection.getAccountInfo(REDEMPTION_QUEUE_PDA);
    
    if (!accountInfo) {
      return [];
    }
    
    const decoded = decodeRedemptionQueue(accountInfo.data);
    setCache(cacheKey, decoded.requests);
    return decoded.requests;
  } catch (error) {
    console.error('Error fetching redemption queue:', error);
    return [];
  }
}

/**
 * Fetch SPL token balance for a user
 * @param {PublicKey} owner - Wallet public key
 * @param {PublicKey} mint - Token mint address
 * @param {boolean} forceRefresh - Skip cache
 * @param {boolean} isPda - Whether owner is a PDA (allows off-curve)
 * @returns {Promise<number>} Balance in token base units
 */
export async function fetchTokenBalance(owner, mint, forceRefresh = false, isPda = false) {
  const cacheKey = `balance:${owner.toBase58()}:${mint.toBase58()}`;
  
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached !== null && cached !== undefined) return cached;
  }
  
  const connection = getConnection();
  
  try {
    // Use allowOwnerOffCurve for PDAs like treasury
    const ata = getAssociatedTokenAddressSync(mint, owner, isPda);
    const accountInfo = await connection.getAccountInfo(ata);
    
    if (!accountInfo) {
      setCache(cacheKey, 0);
      return 0;
    }
    
    // SPL Token account layout: amount is at offset 64 (8 bytes)
    const view = new DataView(accountInfo.data.buffer, accountInfo.data.byteOffset);
    const balance = Number(view.getBigUint64(64, true));
    setCache(cacheKey, balance);
    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

/**
 * Fetch token mint supply
 * @param {PublicKey} mint - Token mint address
 * @param {boolean} forceRefresh - Skip cache
 * @returns {Promise<number>}
 */
export async function fetchMintSupply(mint, forceRefresh = false) {
  const cacheKey = `supply:${mint.toBase58()}`;
  
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached !== null && cached !== undefined) return cached;
  }
  
  const connection = getConnection();
  
  try {
    const mintInfo = await connection.getAccountInfo(mint);
    
    if (!mintInfo) {
      setCache(cacheKey, 0);
      return 0;
    }
    
    // Mint layout: supply is at offset 36 (8 bytes)
    const view = new DataView(mintInfo.data.buffer, mintInfo.data.byteOffset);
    const supply = Number(view.getBigUint64(36, true));
    setCache(cacheKey, supply);
    return supply;
  } catch (error) {
    console.error('Error fetching mint supply:', error);
    return 0;
  }
}

// ============================================================================
// Transaction Building
// ============================================================================

/**
 * Build subscribe instruction
 * @param {PublicKey} user - User wallet
 * @param {number} usdcAmount - Amount in USDC smallest units (6 decimals)
 * @param {PublicKey} reitMint - REI token mint
 * @param {PublicKey} treasury - Treasury token account
 * @returns {TransactionInstruction}
 */
export function buildSubscribeInstruction(user, usdcAmount, reitMint, treasury) {
  const userUsdcAccount = getAssociatedTokenAddressSync(USDC_MINT, user);
  const userReitAccount = getAssociatedTokenAddressSync(reitMint, user);
  
  // Instruction data: discriminator (8) + usdc_amount (u64, 8)
  const data = Buffer.alloc(16);
  DISCRIMINATORS.subscribe.copy(data, 0);
  const view = new DataView(data.buffer);
  view.setBigUint64(8, BigInt(usdcAmount), true);
  
  const keys = [
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: GOVERNANCE_PDA, isSigner: false, isWritable: false },
    { pubkey: NAV_ORACLE_PDA, isSigner: false, isWritable: false },
    { pubkey: userUsdcAccount, isSigner: false, isWritable: true },
    { pubkey: treasury, isSigner: false, isWritable: true },
    { pubkey: userReitAccount, isSigner: false, isWritable: true },
    { pubkey: reitMint, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];
  
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data,
  });
}

/**
 * Build request_redeem instruction
 * @param {PublicKey} requester - User wallet
 * @param {number} tokenAmount - Amount of REI tokens to redeem
 * @param {PublicKey} reitMint - REI token mint
 * @returns {TransactionInstruction}
 */
export function buildRequestRedeemInstruction(requester, tokenAmount, reitMint) {
  const userReitAccount = getAssociatedTokenAddressSync(reitMint, requester);
  
  // Instruction data: discriminator (8) + token_amount (u64, 8)
  const data = Buffer.alloc(16);
  DISCRIMINATORS.requestRedeem.copy(data, 0);
  const view = new DataView(data.buffer);
  view.setBigUint64(8, BigInt(tokenAmount), true);
  
  const keys = [
    { pubkey: requester, isSigner: true, isWritable: true },
    { pubkey: GOVERNANCE_PDA, isSigner: false, isWritable: false },
    { pubkey: REDEMPTION_QUEUE_PDA, isSigner: false, isWritable: true },
    { pubkey: userReitAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];
  
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data,
  });
}

/**
 * Send and confirm a transaction
 * @param {Connection} connection
 * @param {Transaction} transaction
 * @param {Object} wallet - Wallet adapter
 * @returns {Promise<string>} Transaction signature
 */
export async function sendAndConfirmTransaction(connection, transaction, wallet) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  
  const signed = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, 'confirmed');
  
  return signature;
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format a public key for display
 * @param {string} pubkey - Full public key string
 * @param {number} chars - Characters to show on each end
 * @returns {string} Shortened pubkey
 */
export function shortenPubkey(pubkey, chars = 4) {
  if (!pubkey || pubkey.length < chars * 2 + 3) return pubkey;
  return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}

/**
 * Format cents to dollar string
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted dollar string
 */
export function formatUSD(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export function formatCompact(num) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Convert USDC amount (6 decimals) to display string
 * @param {number} amount - Amount in smallest units
 * @returns {string}
 */
export function formatTokenAmount(amount, decimals = 6) {
  return (amount / Math.pow(10, decimals)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
