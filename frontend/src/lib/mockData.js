/**
 * Mock data for Renewra frontend development
 * Replace with real on-chain data in production
 */

export const MOCK_PROJECTS = [
  {
    id: 'desert-sun-1',
    name: 'Desert Sun Solar I',
    type: 'solar',
    capacity_mw: 150,
    offtaker: 'Pacific Gas & Electric',
    annual_revenue: 8500000,
    valuation: 85000000,
    location: 'Mojave Desert, CA',
    completion_year: 2023,
    irr: 8.5,
  },
  {
    id: 'coastal-wind-1',
    name: 'Coastal Wind Farm',
    type: 'wind',
    capacity_mw: 200,
    offtaker: 'Southern California Edison',
    annual_revenue: 12000000,
    valuation: 120000000,
    location: 'Tehachapi Pass, CA',
    completion_year: 2022,
    irr: 9.2,
  },
  {
    id: 'grid-battery-1',
    name: 'Valley Grid Storage',
    type: 'storage',
    capacity_mw: 100,
    offtaker: 'CAISO Grid',
    annual_revenue: 6500000,
    valuation: 65000000,
    location: 'Central Valley, CA',
    completion_year: 2024,
    irr: 7.8,
  },
  {
    id: 'mountain-wind-1',
    name: 'Mountain Ridge Wind',
    type: 'wind',
    capacity_mw: 175,
    offtaker: 'Arizona Public Service',
    annual_revenue: 10200000,
    valuation: 102000000,
    location: 'Flagstaff, AZ',
    completion_year: 2023,
    irr: 8.9,
  },
  {
    id: 'rooftop-solar-1',
    name: 'Metro Rooftop Solar Portfolio',
    type: 'solar',
    capacity_mw: 50,
    offtaker: 'Commercial PPAs (Mixed)',
    annual_revenue: 3800000,
    valuation: 38000000,
    location: 'Los Angeles, CA',
    completion_year: 2024,
    irr: 10.1,
  },
];

export const MOCK_FUND_STATS = {
  currentNav: 5027, // $50.27
  totalSupply: 8150000, // 8.15M tokens
  fundValue: 410000000, // $410M
  ytdYield: 7.2,
  projectCount: 5,
  lastNavUpdate: Date.now() - 1800000, // 30 mins ago
};

export const MOCK_NAV_HISTORY = [
  { nav: 5000, timestamp: Date.now() - 86400000 * 30 },
  { nav: 5012, timestamp: Date.now() - 86400000 * 25 },
  { nav: 5008, timestamp: Date.now() - 86400000 * 20 },
  { nav: 5015, timestamp: Date.now() - 86400000 * 15 },
  { nav: 5020, timestamp: Date.now() - 86400000 * 10 },
  { nav: 5018, timestamp: Date.now() - 86400000 * 5 },
  { nav: 5025, timestamp: Date.now() - 86400000 * 2 },
  { nav: 5027, timestamp: Date.now() },
];

export const MOCK_USER_HOLDINGS = {
  reiBalance: 1250,
  avgPurchasePrice: 4980,
  totalInvested: 62250,
  currentValue: 62838,
  unrealizedGain: 588,
  pendingYield: 125,
};

export const MOCK_REDEMPTION_REQUESTS = [
  {
    id: 'redeem-001',
    userPubkey: '7vHZ...4kFq',
    tokenAmount: 500,
    requestedAt: Date.now() - 172800000,
    status: 'completed',
  },
  {
    id: 'redeem-002',
    userPubkey: '3xMN...9pRe',
    tokenAmount: 1000,
    requestedAt: Date.now() - 86400000,
    status: 'processing',
  },
  {
    id: 'redeem-003',
    userPubkey: '9kLp...2wXy',
    tokenAmount: 250,
    requestedAt: Date.now() - 3600000,
    status: 'pending',
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 'tx-001',
    type: 'subscribe',
    amount: 10000,
    tokens: 200,
    nav: 5000,
    timestamp: Date.now() - 604800000,
    signature: '3xMN...9pRe',
  },
  {
    id: 'tx-002',
    type: 'subscribe',
    amount: 25000,
    tokens: 500,
    nav: 5000,
    timestamp: Date.now() - 432000000,
    signature: '7vHZ...4kFq',
  },
  {
    id: 'tx-003',
    type: 'yield',
    amount: 125,
    tokens: 0,
    nav: 5020,
    timestamp: Date.now() - 86400000,
    signature: '9kLp...2wXy',
  },
];
