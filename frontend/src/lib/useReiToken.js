/**
 * useReiToken - Custom React hook for Renewra program interaction
 * 
 * Provides:
 * - Real-time NAV and fund statistics
 * - User token balances
 * - Subscribe and redeem transaction functions
 * - Auto-refresh on wallet changes and intervals
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

import {
  PROGRAM_ID,
  USDC_MINT,
  NAV_ORACLE_PDA,
  GOVERNANCE_PDA,
  fetchCurrentNav,
  fetchGovernance,
  fetchRedemptionQueue,
  fetchTokenBalance,
  fetchMintSupply,
  buildSubscribeInstruction,
  buildRequestRedeemInstruction,
  deriveReitMintPDA,
  deriveTreasuryPDA,
  sendAndConfirmTransaction,
  getConnection,
  clearCache,
} from './solana';

// Refresh intervals (ms) - longer intervals to avoid rate limits
const NAV_REFRESH_INTERVAL = 180000; // 3 minutes
const BALANCE_REFRESH_INTERVAL = 120000; // 2 minutes

// Simple delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Request delay to avoid rate limits
const REQUEST_DELAY = 500;

/**
 * @typedef {Object} ReiTokenState
 * @property {number} currentNav - Current NAV in cents
 * @property {number} previousNav - Previous NAV in cents
 * @property {Date} navTimestamp - Last NAV update timestamp
 * @property {number} tokenSupply - Total REI token supply (6 decimals)
 * @property {number} userReiBalance - User's REI token balance
 * @property {number} userUsdcBalance - User's USDC balance
 * @property {number} treasuryBalance - Treasury USDC balance
 * @property {number} mintFeeBps - Mint fee in basis points
 * @property {number} redeemFeeBps - Redemption fee in basis points
 * @property {Array} redemptionQueue - Pending redemption requests
 */

/**
 * @typedef {Object} UseReiTokenReturn
 * @property {ReiTokenState} data - Current state data
 * @property {boolean} loading - Whether data is being fetched
 * @property {string|null} error - Error message if any
 * @property {boolean} isSubmitting - Whether a transaction is in progress
 * @property {Function} subscribe - Subscribe to fund with USDC
 * @property {Function} requestRedeem - Request redemption of REI tokens
 * @property {Function} refresh - Manually refresh all data
 */

/**
 * Custom hook for interacting with Renewra on-chain program
 * @returns {UseReiTokenReturn}
 */
export function useReiToken() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  
  // State
  const [data, setData] = useState({
    currentNav: 0,
    previousNav: 0,
    navTimestamp: null,
    tokenSupply: 0,
    userReiBalance: 0,
    userUsdcBalance: 0,
    treasuryBalance: 0,
    mintFeeBps: 50,
    redeemFeeBps: 100,
    redemptionQueue: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs to prevent duplicate requests
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);
  const MIN_REFRESH_INTERVAL = 5000; // Minimum 5 seconds between refreshes
  
  // Derived PDAs (memoized)
  const [reitMint] = deriveReitMintPDA();
  const [treasury] = deriveTreasuryPDA();

  // ========================================================================
  // Data Fetching - Sequential to avoid rate limits
  // ========================================================================

  /**
   * Fetch all data sequentially with delays to avoid rate limiting
   */
  const refresh = useCallback(async () => {
    // Prevent duplicate/rapid refreshes
    const now = Date.now();
    if (isRefreshing.current || (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL)) {
      console.log('Skipping refresh - too soon or already refreshing');
      return;
    }
    
    isRefreshing.current = true;
    lastRefreshTime.current = now;
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch NAV data first (most important)
      const navData = await fetchCurrentNav();
      setData(prev => ({
        ...prev,
        currentNav: navData?.navCents || 0,
        previousNav: navData?.previousNavCents || 0,
        navTimestamp: navData?.timestamp || null,
      }));
      
      await delay(REQUEST_DELAY);
      
      // 2. Fetch governance
      const governance = await fetchGovernance();
      if (governance) {
        setData(prev => ({
          ...prev,
          mintFeeBps: governance.mintFeeBps || 50,
          redeemFeeBps: governance.redemptionFeeBps || 100,
        }));
      }
      
      await delay(REQUEST_DELAY);
      
      // 3. Fetch token supply
      const supply = await fetchMintSupply(reitMint);
      setData(prev => ({
        ...prev,
        tokenSupply: supply || 0,
      }));
      
      await delay(REQUEST_DELAY);
      
      // 4. Fetch treasury balance (treasury is a PDA, so isPda=true)
      const treasuryBal = await fetchTokenBalance(treasury, USDC_MINT, false, true);
      setData(prev => ({
        ...prev,
        treasuryBalance: treasuryBal || 0,
      }));
      
      // 5. Fetch user balances if connected
      if (publicKey) {
        await delay(REQUEST_DELAY);
        
        const reiBalance = await fetchTokenBalance(publicKey, reitMint, false, false);
        setData(prev => ({
          ...prev,
          userReiBalance: reiBalance || 0,
        }));
        
        await delay(REQUEST_DELAY);
        
        const usdcBalance = await fetchTokenBalance(publicKey, USDC_MINT);
        setData(prev => ({
          ...prev,
          userUsdcBalance: usdcBalance || 0,
        }));
      }
      
      // 6. Fetch redemption queue (optional, may fail)
      try {
        await delay(REQUEST_DELAY);
        const queue = await fetchRedemptionQueue();
        setData(prev => ({
          ...prev,
          redemptionQueue: queue || [],
        }));
      } catch (queueErr) {
        console.warn('Could not fetch redemption queue:', queueErr.message);
      }
      
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, [publicKey, reitMint, treasury]);

  // ========================================================================
  // Transaction Functions
  // ========================================================================

  /**
   * Subscribe to fund by depositing USDC
   * @param {number} usdcAmount - Amount in USDC (e.g., 100.5 = $100.50)
   * @returns {Promise<string>} Transaction signature
   */
  const subscribe = useCallback(async (usdcAmount) => {
    if (!connected || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    if (usdcAmount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert to smallest units (6 decimals)
      const amountSmallest = Math.floor(usdcAmount * 1_000_000);
      
      // Get connection
      const conn = getConnection();
      
      // Check if user has REI token account, create if not
      const userReiAta = getAssociatedTokenAddressSync(reitMint, publicKey);
      const ataInfo = await conn.getAccountInfo(userReiAta);
      
      const transaction = new Transaction();
      
      // Add ATA creation instruction if needed
      if (!ataInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,     // payer
            userReiAta,    // ata
            publicKey,     // owner
            reitMint       // mint
          )
        );
      }
      
      // Add subscribe instruction
      const treasuryAta = getAssociatedTokenAddressSync(USDC_MINT, treasury, true);
      transaction.add(
        buildSubscribeInstruction(publicKey, amountSmallest, reitMint, treasuryAta)
      );
      
      // Send transaction
      const signature = await sendAndConfirmTransaction(
        conn,
        transaction,
        { publicKey, signTransaction }
      );
      
      console.log('Subscribe successful:', signature);
      
      // Refresh balances after a delay
      await delay(2000);
      await refresh();
      
      return signature;
    } catch (err) {
      const errorMessage = err.message || 'Subscribe transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [connected, publicKey, signTransaction, reitMint, treasury, refresh]);

  /**
   * Request redemption of REI tokens
   * @param {number} tokenAmount - Amount of REI tokens to redeem (e.g., 10.5 = 10.5 tokens)
   * @returns {Promise<string>} Transaction signature
   */
  const requestRedeem = useCallback(async (tokenAmount) => {
    if (!connected || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    if (tokenAmount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Convert to smallest units (6 decimals)
    const amountSmallest = Math.floor(tokenAmount * 1_000_000);
    
    if (amountSmallest > data.userReiBalance) {
      throw new Error('Insufficient REI balance');
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const conn = getConnection();
      
      const transaction = new Transaction();
      transaction.add(
        buildRequestRedeemInstruction(publicKey, amountSmallest, reitMint)
      );
      
      const signature = await sendAndConfirmTransaction(
        conn,
        transaction,
        { publicKey, signTransaction }
      );
      
      console.log('Redeem request successful:', signature);
      
      // Refresh data after a delay
      await delay(2000);
      await refresh();
      
      return signature;
    } catch (err) {
      const errorMessage = err.message || 'Redeem request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [connected, publicKey, signTransaction, data.userReiBalance, reitMint, refresh]);

  // ========================================================================
  // Effects
  // ========================================================================

  // Initial data fetch on mount only
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when wallet changes
  useEffect(() => {
    if (publicKey) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  // Set up polling interval (single interval to avoid rate limits)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      refresh();
    }, NAV_REFRESH_INTERVAL);
    
    return () => {
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================================================================
  // Return
  // ========================================================================

  return {
    // State
    data,
    loading,
    error,
    isSubmitting,
    
    // Computed values
    currentNav: data.currentNav,
    tokenSupply: data.tokenSupply,
    userBalance: data.userReiBalance,
    treasuryBalance: data.treasuryBalance,
    
    // Functions
    subscribe,
    requestRedeem,
    refresh,
    
    // Utility getters
    isConnected: connected,
    walletAddress: publicKey?.toBase58(),
  };
}

export default useReiToken;
