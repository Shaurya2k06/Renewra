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
 */

/**
 * @typedef {Object} NavSnapshot
 * @property {number} nav - NAV in cents
 * @property {number} timestamp - Unix timestamp
 * @property {string} txSignature - Transaction signature
 */

/**
 * @typedef {Object} RedemptionRequest
 * @property {string} id
 * @property {string} userPubkey
 * @property {number} tokenAmount
 * @property {number} requestedAt
 * @property {'pending' | 'processing' | 'completed'} status
 */

/**
 * @typedef {Object} UserHoldings
 * @property {number} reiBalance - REI token balance
 * @property {number} avgPurchasePrice - Average purchase price in cents
 * @property {number} totalInvested - Total USDC invested
 * @property {number} currentValue - Current value based on NAV
 * @property {number} unrealizedGain - Unrealized gain/loss
 * @property {number} pendingYield - Accrued yield not yet distributed
 */

/**
 * @typedef {Object} FundStats
 * @property {number} currentNav - Current NAV in cents
 * @property {number} totalSupply - Total REI tokens in circulation
 * @property {number} fundValue - Total fund value in USDC
 * @property {number} ytdYield - Year-to-date yield percentage
 * @property {number} projectCount - Number of projects in portfolio
 */

export const PROJECT_TYPES = {
  solar: { label: 'Solar', color: '#f59e0b', icon: '☀️' },
  wind: { label: 'Wind', color: '#3b82f6', icon: '💨' },
  storage: { label: 'Storage', color: '#10b981', icon: '🔋' },
};

export default {};
