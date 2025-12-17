/**
 * TypeScript-style interfaces as JSDoc for Renewra frontend
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {'solar' | 'wind' | 'storage'} type
 * @property {number} capacity_mw
 * @property {string} offtaker
 * @property {number} annual_revenue
 * @property {number} valuation
 * @property {string} location
 * @property {number} completion_year
 * @property {number} irr - Internal rate of return percentage
 */

/**
 * @typedef {Object} NavSnapshot
 * @property {number} nav - NAV in cents
 * @property {number} timestamp - Unix timestamp in milliseconds
 * @property {string} [txSignature] - Transaction signature (optional)
 */

/**
 * @typedef {Object} RedemptionRequest
 * @property {string} id
 * @property {string} requester - Requester public key
 * @property {number} tokenAmount - Amount of REI tokens
 * @property {number} requestedAt - Unix timestamp in milliseconds
 * @property {'pending' | 'approved' | 'settled' | 'processing' | 'completed'} status
 */

/**
 * @typedef {Object} UserHoldings
 * @property {number} reiBalance - REI token balance (6 decimals)
 * @property {number} usdcBalance - USDC balance (6 decimals)
 * @property {number} avgPurchasePrice - Average purchase price in cents
 * @property {number} totalInvested - Total USDC invested (cents)
 * @property {number} currentValue - Current value based on NAV (cents)
 * @property {number} unrealizedGain - Unrealized gain/loss (cents)
 * @property {number} pendingYield - Accrued yield not yet distributed (cents)
 */

/**
 * @typedef {Object} FundStats
 * @property {number} currentNav - Current NAV in cents
 * @property {number} previousNav - Previous NAV in cents
 * @property {Date} navTimestamp - Last NAV update timestamp
 * @property {number} totalSupply - Total REI tokens in circulation (6 decimals)
 * @property {number} treasuryBalance - Treasury USDC balance (6 decimals)
 * @property {number} fundValue - Total fund value in USDC cents
 * @property {number} ytdYield - Year-to-date yield percentage
 * @property {number} projectCount - Number of projects in portfolio
 */

/**
 * @typedef {Object} ReiTokenState
 * @property {number} currentNav - Current NAV in cents
 * @property {number} previousNav - Previous NAV in cents
 * @property {Date|null} navTimestamp - Last NAV update timestamp
 * @property {number} tokenSupply - Total REI token supply (6 decimals)
 * @property {number} userReiBalance - User's REI token balance (6 decimals)
 * @property {number} userUsdcBalance - User's USDC balance (6 decimals)
 * @property {number} treasuryBalance - Treasury USDC balance (6 decimals)
 * @property {number} mintFeeBps - Mint fee in basis points
 * @property {number} redeemFeeBps - Redemption fee in basis points
 * @property {RedemptionRequest[]} redemptionQueue - Pending redemption requests
 */

/**
 * @typedef {Object} GovernanceState
 * @property {string} adminKey - Admin public key
 * @property {string} oracleSigner - Oracle signer public key
 * @property {number} managementFeeBps - Management fee in basis points
 * @property {number} mintFeeBps - Mint fee in basis points
 * @property {number} redemptionFeeBps - Redemption fee in basis points
 * @property {boolean} paused - Whether the fund is paused
 */

/**
 * @typedef {Object} TransactionRecord
 * @property {string} id
 * @property {'subscribe' | 'redeem' | 'yield'} type
 * @property {number} amount - USDC amount in cents
 * @property {number} tokens - REI tokens involved
 * @property {number} nav - NAV at time of transaction (cents)
 * @property {number} timestamp - Unix timestamp in milliseconds
 * @property {string} signature - Transaction signature
 */

export const PROJECT_TYPES = {
  solar: { label: 'Solar', color: '#f59e0b', icon: 'Sun' },
  wind: { label: 'Wind', color: '#3b82f6', icon: 'Wind' },
  storage: { label: 'Storage', color: '#10b981', icon: 'Battery' },
};

/**
 * Redemption status enum values
 */
export const REDEMPTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SETTLED: 'settled',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
};

/**
 * Token decimals
 */
export const DECIMALS = {
  USDC: 6,
  REI: 6,
};

/**
 * Convert token amount to display value
 * @param {number} amount - Amount in smallest units
 * @param {number} decimals - Number of decimals
 * @returns {number}
 */
export function toDisplayAmount(amount, decimals = 6) {
  return amount / Math.pow(10, decimals);
}

/**
 * Convert display value to token amount
 * @param {number} displayAmount - Display amount
 * @param {number} decimals - Number of decimals
 * @returns {number}
 */
export function toTokenAmount(displayAmount, decimals = 6) {
  return Math.floor(displayAmount * Math.pow(10, decimals));
}

export default {};
