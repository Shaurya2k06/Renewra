/**
 * Zustand store for Renewra application state
 */

import { create } from 'zustand';
import { MOCK_FUND_STATS, MOCK_USER_HOLDINGS, MOCK_NAV_HISTORY } from './mockData';

export const useStore = create((set, get) => ({
  // Fund state
  fundStats: MOCK_FUND_STATS,
  navHistory: MOCK_NAV_HISTORY,
  
  // User state
  userHoldings: null,
  isWalletConnected: false,
  
  // UI state
  isLoading: false,
  error: null,
  
  // Actions
  setFundStats: (stats) => set({ fundStats: stats }),
  setNavHistory: (history) => set({ navHistory: history }),
  
  setUserHoldings: (holdings) => set({ userHoldings: holdings }),
  setWalletConnected: (connected) => set({ 
    isWalletConnected: connected,
    userHoldings: connected ? MOCK_USER_HOLDINGS : null,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Computed getters
  getCurrentNav: () => get().fundStats?.currentNav || 0,
  
  // Async actions (to be implemented with real data)
  refreshFundStats: async () => {
    set({ isLoading: true });
    try {
      // TODO: Fetch from chain
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ fundStats: MOCK_FUND_STATS, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  refreshNavHistory: async () => {
    set({ isLoading: true });
    try {
      // TODO: Fetch from chain
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ navHistory: MOCK_NAV_HISTORY, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useStore;
