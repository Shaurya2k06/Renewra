/**
 * Solana RPC helper functions for Renewra
 * Currently returns mock data - will be replaced with real RPC calls
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { MOCK_FUND_STATS, MOCK_NAV_HISTORY } from './mockData';

// Environment variables
export const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID || '';
export const RPC_URL = import.meta.env.VITE_DEVNET_RPC || 'https://api.devnet.solana.com';
export const GOVERNANCE_PDA = import.meta.env.VITE_GOVERNANCE_PDA || '';
export const NAV_ORACLE_PDA = import.meta.env.VITE_NAV_ORACLE_PDA || '';

/**
 * Get Solana connection instance
 */
export function getConnection() {
  return new Connection(RPC_URL, 'confirmed');
}

/**
 * Fetch current NAV from on-chain oracle
 * @returns {Promise<number>} NAV in cents
 */
export async function fetchCurrentNav() {
  // TODO: Replace with actual on-chain fetch
  // const connection = getConnection();
  // const navOraclePubkey = new PublicKey(NAV_ORACLE_PDA);
  // const accountInfo = await connection.getAccountInfo(navOraclePubkey);
  // ... decode account data
  
  return MOCK_FUND_STATS.currentNav;
}

/**
 * Fetch NAV history
 * @returns {Promise<Array>} Array of NAV snapshots
 */
export async function fetchNavHistory() {
  // TODO: Replace with actual historical data fetch
  return MOCK_NAV_HISTORY;
}

/**
 * Fetch fund statistics
 * @returns {Promise<Object>} Fund stats object
 */
export async function fetchFundStats() {
  // TODO: Replace with actual on-chain fetch
  return MOCK_FUND_STATS;
}

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
