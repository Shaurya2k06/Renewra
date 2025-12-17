/**
 * Zustand store for Renewra application state
 * Combines on-chain data with UI state management
 */

import { create } from 'zustand';
import { MOCK_FUND_STATS, MOCK_USER_HOLDINGS, MOCK_NAV_HISTORY } from './mockData';
import { fetchCurrentNav, fetchGovernance, fetchRedemptionQueue } from './solana';

/**
 * Main application store
 */
export const useStore = create((set, get) => ({
  // ========================================================================
  // Fund State (from on-chain)
  // ========================================================================
  fundStats: {
    currentNav: 5000,
    previousNav: 5000,
    navTimestamp: null,
    totalSupply: 0,
    fundValue: 0,
    ytdYield: 7.2,
    projectCount: 5,
    lastNavUpdate: Date.now(),
  },
  navHistory: MOCK_NAV_HISTORY,
  governance: null,
  redemptionQueue: [],
  
  // ========================================================================
  // User State
  // ========================================================================
  userHoldings: null,
  isWalletConnected: false,
  walletAddress: null,
  
  // ========================================================================
  // UI State
  // ========================================================================
  isLoading: false,
  error: null,
  lastRefresh: null,
  
  // ========================================================================
  // Actions - Fund Data
  // ========================================================================
  
  setFundStats: (stats) => set((state) => ({ 
    fundStats: { ...state.fundStats, ...stats } 
  })),
  
  setNavHistory: (history) => set({ navHistory: history }),
  
  setGovernance: (governance) => set({ governance }),
  
  setRedemptionQueue: (queue) => set({ redemptionQueue: queue }),
  
  // ========================================================================
  // Actions - User Data
  // ========================================================================
  
  setUserHoldings: (holdings) => set({ userHoldings: holdings }),
  
  setWalletConnected: (connected, address = null) => set({ 
    isWalletConnected: connected,
    walletAddress: address,
    userHoldings: connected ? MOCK_USER_HOLDINGS : null,
  }),
  
  updateUserBalance: (reiBalance, usdcBalance) => set((state) => ({
    userHoldings: state.userHoldings ? {
      ...state.userHoldings,
      reiBalance,
      usdcBalance,
      currentValue: reiBalance * (state.fundStats.currentNav / 100),
    } : null,
  })),
  
  // ========================================================================
  // Actions - UI State
  // ========================================================================
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // ========================================================================
  // Computed Getters
  // ========================================================================
  
  getCurrentNav: () => get().fundStats?.currentNav || 0,
  
  getFundValue: () => {
    const { fundStats } = get();
    if (!fundStats) return 0;
    // Fund value = total supply * NAV / 100 (NAV in cents)
    return (fundStats.totalSupply * fundStats.currentNav) / 100;
  },
  
  getUserGainLoss: () => {
    const { userHoldings, fundStats } = get();
    if (!userHoldings || !fundStats) return { amount: 0, percent: 0 };
    
    const currentValue = userHoldings.reiBalance * (fundStats.currentNav / 100);
    const gainAmount = currentValue - userHoldings.totalInvested;
    const gainPercent = userHoldings.totalInvested > 0 
      ? (gainAmount / userHoldings.totalInvested) * 100 
      : 0;
    
    return { amount: gainAmount, percent: gainPercent };
  },
  
  // ========================================================================
  // Async Actions - Data Fetching
  // ========================================================================
  
  refreshFundStats: async () => {
    set({ isLoading: true });
    try {
      const navData = await fetchCurrentNav();
      
      set((state) => ({ 
        fundStats: {
          ...state.fundStats,
          currentNav: navData.navCents,
          previousNav: navData.previousNavCents,
          navTimestamp: navData.timestamp,
          lastNavUpdate: Date.now(),
        },
        isLoading: false,
        lastRefresh: Date.now(),
      }));
    } catch (error) {
      console.error('Error refreshing fund stats:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  refreshGovernance: async () => {
    try {
      const governance = await fetchGovernance();
      set({ governance });
    } catch (error) {
      console.error('Error refreshing governance:', error);
    }
  },
  
  refreshRedemptionQueue: async () => {
    try {
      const queue = await fetchRedemptionQueue();
      set({ redemptionQueue: queue });
    } catch (error) {
      console.error('Error refreshing redemption queue:', error);
    }
  },
  
  refreshNavHistory: async () => {
    set({ isLoading: true });
    try {
      // TODO: Fetch from indexer or event logs
      // For now, generate from current NAV
      const currentNav = get().fundStats.currentNav;
      const history = generateNavHistory(currentNav);
      
      set({ navHistory: history, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  refreshAll: async () => {
    const { refreshFundStats, refreshGovernance, refreshRedemptionQueue, refreshNavHistory } = get();
    
    set({ isLoading: true });
    try {
      await Promise.all([
        refreshFundStats(),
        refreshGovernance(),
        refreshRedemptionQueue(),
        refreshNavHistory(),
      ]);
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

/**
 * Generate mock NAV history based on current NAV
 * @param {number} currentNav - Current NAV in cents
 * @returns {Array}
 */
function generateNavHistory(currentNav) {
  const history = [];
  const now = Date.now();
  const dayMs = 86400000;
  
  // Generate 30 days of history with slight variations
  for (let i = 30; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 50; // ±$0.25
    const nav = Math.max(4500, Math.min(5500, currentNav + variance - (i * 2)));
    
    history.push({
      nav: Math.round(nav),
      timestamp: now - (i * dayMs),
    });
  }
  
  // Ensure last entry matches current NAV
  history[history.length - 1].nav = currentNav;
  
  return history;
}

export default useStore;
