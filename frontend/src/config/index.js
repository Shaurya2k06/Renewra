/**
 * Application Configuration
 * Centralized configuration management for production/development environments
 */

export const config = {
  // Network Configuration
  solana: {
    network: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
    rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    programId: import.meta.env.VITE_PROGRAM_ID,
    usdcMint: import.meta.env.VITE_USDC_MINT,
  },

  // PDA Seeds
  seeds: {
    governance: import.meta.env.VITE_GOVERNANCE_SEED || 'governance',
    navOracle: import.meta.env.VITE_NAV_ORACLE_SEED || 'nav_oracle',
    treasury: import.meta.env.VITE_TREASURY_SEED || 'treasury',
    reitMint: import.meta.env.VITE_REIT_MINT_SEED || 'reit_mint',
    redemptionQueue: import.meta.env.VITE_REDEMPTION_QUEUE_SEED || 'redemption_queue',
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Renewra',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@renewra.io',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Transaction Configuration
  transaction: {
    confirmTimeout: 60000, // 60 seconds
    maxRetries: 3,
    cacheTTL: 30000, // 30 seconds
  },

  // UI Configuration
  ui: {
    refreshInterval: 120000, // 2 minutes
    toastDuration: 5000, // 5 seconds
  },

  // Validation Rules
  validation: {
    minSubscribeAmount: 10, // Minimum 10 USDC
    maxSubscribeAmount: 1000000, // Maximum 1M USDC
    minRedeemAmount: 0.01, // Minimum 0.01 REI
  },

  // Explorer URLs
  explorer: {
    transaction: (signature) => 
      `https://explorer.solana.com/tx/${signature}?cluster=${config.solana.network}`,
    address: (address) => 
      `https://explorer.solana.com/address/${address}?cluster=${config.solana.network}`,
  },
};

// Validation on startup
if (!config.solana.programId) {
  console.error('❌ VITE_PROGRAM_ID is not configured');
}

if (!config.solana.usdcMint) {
  console.error('❌ VITE_USDC_MINT is not configured');
}

export default config;
