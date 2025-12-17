import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/StatCard';
import { useReiToken } from '../lib/useReiToken';
import { formatUSD, formatDate, shortenPubkey } from '../lib/solana';
import { toDisplayAmount } from '../lib/types';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { data, loading, refresh } = useReiToken();

  // Refresh on mount
  useEffect(() => {
    if (connected) {
      refresh();
    }
  }, [connected, refresh]);

  // Calculate values
  const currentNav = data?.currentNav || 0;
  const navDisplay = toDisplayAmount(currentNav, 2); // NAV stored in cents
  const reiBalance = toDisplayAmount(data?.userReiBalance || 0, 6);
  const tokenSupply = toDisplayAmount(data?.tokenSupply || 0, 6);
  const currentValue = reiBalance * navDisplay;
  
  // Calculate share of fund
  const sharePercent = tokenSupply > 0 ? (reiBalance / tokenSupply * 100).toFixed(4) : '0.0000';

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Connect Your Wallet
        </h1>
        <p className="text-gray-400 mb-8">
          Connect your Solana wallet to view your REI holdings and transaction history.
        </p>
        <Button 
          onClick={() => setVisible(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-gray-400">
            Wallet: {shortenPubkey(publicKey?.toBase58(), 6)}
          </p>
        </div>
        <Button 
          onClick={refresh}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </Button>
      </div>

      {/* Loading State */}
      {loading && !data?.currentNav && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading on-chain data...</p>
        </div>
      )}

      {/* Holdings Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="REI Balance"
          value={`${reiBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} REI`}
          subValue={`≈ $${currentValue.toFixed(2)}`}
          icon={Coins}
        />
        <StatCard
          label="Current NAV"
          value={`$${navDisplay.toFixed(2)}`}
          subValue="Per REI token"
          icon={BarChart3}
        />
        <StatCard
          label="USDC Balance"
          value={`${toDisplayAmount(data?.userUsdcBalance || 0, 6).toFixed(2)} USDC`}
          subValue="Available to invest"
          icon={WalletIcon}
        />
        <StatCard
          label="Fund Share"
          value={`${sharePercent}%`}
          subValue={`of ${tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} REI`}
          icon={Clock}
        />
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">REI Token Balance</span>
              <span className="text-white font-medium">
                {reiBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} REI
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Current Value (at NAV)</span>
              <span className="text-white font-medium">
                ${currentValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Treasury Balance</span>
              <span className="text-white font-medium">
                {toDisplayAmount(data?.treasuryBalance || 0, 6).toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Total REI Supply</span>
              <span className="text-white font-medium">
                {tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} REI
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Your Share of Fund</p>
              <p className="text-4xl font-bold text-white">{sharePercent}%</p>
              <p className="text-gray-500 text-sm mt-2">
                Based on current token holdings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fund Info */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Fund Information</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Mint Fee</p>
            <p className="text-xl font-bold text-white">{(data?.mintFeeBps || 50) / 100}%</p>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Redeem Fee</p>
            <p className="text-xl font-bold text-white">{(data?.redeemFeeBps || 50) / 100}%</p>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Management Fee</p>
            <p className="text-xl font-bold text-white">{(data?.mgmtFeeBps || 200) / 100}%</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button 
            onClick={() => window.location.href = '/subscribe'}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Subscribe to Fund
          </Button>
          <Button 
            onClick={() => window.location.href = '/redeem'}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Request Redemption
          </Button>
        </div>
      </div>
    </div>
  );
}
