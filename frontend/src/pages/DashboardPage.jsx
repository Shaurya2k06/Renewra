import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/StatCard';
import { useStore } from '../lib/store';
import { formatUSD, formatDate, shortenPubkey } from '../lib/solana';
import { MOCK_TRANSACTIONS } from '../lib/mockData';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { userHoldings, fundStats } = useStore();

  // Calculate gain/loss percentage
  const gainPercent = userHoldings?.avgPurchasePrice 
    ? (((fundStats?.currentNav || 0) - userHoldings.avgPurchasePrice) / userHoldings.avgPurchasePrice * 100).toFixed(2)
    : 0;

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
        <p className="text-gray-400">
          Wallet: {shortenPubkey(publicKey?.toBase58(), 6)}
        </p>
      </div>

      {/* Holdings Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="REI Balance"
          value={`${userHoldings?.reiBalance?.toLocaleString() || 0} REI`}
          subValue={`≈ ${formatUSD(userHoldings?.currentValue || 0)}`}
          icon="🪙"
        />
        <StatCard
          label="Avg Purchase Price"
          value={formatUSD(userHoldings?.avgPurchasePrice || 0)}
          subValue={`Current: ${formatUSD(fundStats?.currentNav || 0)}`}
          icon="📊"
        />
        <StatCard
          label="Unrealized P&L"
          value={formatUSD(userHoldings?.unrealizedGain || 0)}
          subValue={`${gainPercent}%`}
          trend={userHoldings?.unrealizedGain >= 0 ? 'up' : 'down'}
          icon={userHoldings?.unrealizedGain >= 0 ? '📈' : '📉'}
        />
        <StatCard
          label="Pending Yield"
          value={formatUSD(userHoldings?.pendingYield || 0)}
          subValue="Next distribution: ~7 days"
          icon="🌱"
        />
      </div>

      {/* Portfolio Summary */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Total Invested</span>
              <span className="text-white font-medium">
                {formatUSD(userHoldings?.totalInvested || 0)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Current Value</span>
              <span className="text-white font-medium">
                {formatUSD(userHoldings?.currentValue || 0)}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Net Gain/Loss</span>
              <span className={`font-medium ${userHoldings?.unrealizedGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {userHoldings?.unrealizedGain >= 0 ? '+' : ''}{formatUSD(userHoldings?.unrealizedGain || 0)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Your Share of Fund</p>
              <p className="text-4xl font-bold text-white">
                {fundStats?.totalSupply 
                  ? ((userHoldings?.reiBalance || 0) / fundStats.totalSupply * 100).toFixed(4)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Tokens</th>
                <th className="pb-3 font-medium">NAV</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Signature</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800">
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.type === 'subscribe' 
                        ? 'bg-green-900/50 text-green-400' 
                        : tx.type === 'yield'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-white">{formatUSD(tx.amount)}</td>
                  <td className="py-3 text-gray-300">{tx.tokens > 0 ? `+${tx.tokens}` : '-'}</td>
                  <td className="py-3 text-gray-300">{formatUSD(tx.nav)}</td>
                  <td className="py-3 text-gray-400 text-sm">{formatDate(tx.timestamp)}</td>
                  <td className="py-3">
                    <a 
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:underline text-sm"
                    >
                      {tx.signature}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
