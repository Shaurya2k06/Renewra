import { useEffect } from 'react';
import NavChart from '../components/NavChart';
import { useStore } from '../lib/store';
import { formatUSD, formatDate } from '../lib/solana';

export default function NavHistoryPage() {
  const { navHistory, fundStats, refreshNavHistory } = useStore();

  useEffect(() => {
    // Refresh nav history on mount
    refreshNavHistory();
  }, []);

  // Mock yield distribution events
  const yieldEvents = [
    { id: 1, amount: 125000, timestamp: Date.now() - 604800000, nav: 5020, signature: 'YLD1...abc' },
    { id: 2, amount: 118500, timestamp: Date.now() - 1209600000, nav: 5010, signature: 'YLD2...def' },
    { id: 3, amount: 122000, timestamp: Date.now() - 1814400000, nav: 5005, signature: 'YLD3...ghi' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">NAV History</h1>
        <p className="text-gray-400">
          Track the Net Asset Value of the Renewra fund over time
        </p>
      </div>

      {/* Current NAV Card */}
      <div className="bg-gradient-to-r from-green-900/30 to-green-800/10 border border-green-700/50 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-green-400 text-sm font-medium mb-1">Current NAV</p>
            <p className="text-4xl font-bold text-white">
              {formatUSD(fundStats?.currentNav || 5000)}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-gray-400 text-sm">24h Change</p>
              <p className="text-green-400 font-semibold">+0.08%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">30d Change</p>
              <p className="text-green-400 font-semibold">+0.54%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Update</p>
              <p className="text-white font-medium">
                {formatDate(fundStats?.lastNavUpdate || Date.now())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NAV Chart */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">NAV Over Time</h2>
          <div className="flex gap-2">
            {['7D', '30D', '90D', '1Y', 'ALL'].map((period) => (
              <button
                key={period}
                className={`px-3 py-1 rounded text-sm ${
                  period === '30D' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <NavChart data={navHistory} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* NAV Snapshots Table */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">NAV Snapshots</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">NAV</th>
                  <th className="pb-3 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {navHistory.slice().reverse().map((snapshot, index, arr) => {
                  const prevNav = arr[index + 1]?.nav || snapshot.nav;
                  const change = ((snapshot.nav - prevNav) / prevNav * 100).toFixed(2);
                  const isPositive = parseFloat(change) >= 0;
                  
                  return (
                    <tr key={snapshot.timestamp} className="border-b border-gray-800">
                      <td className="py-3 text-gray-400 text-sm">
                        {formatDate(snapshot.timestamp)}
                      </td>
                      <td className="py-3 text-white font-medium">
                        {formatUSD(snapshot.nav)}
                      </td>
                      <td className={`py-3 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{change}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Yield Distribution History */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Yield Distributions</h2>
          <div className="space-y-4">
            {yieldEvents.map((event) => (
              <div 
                key={event.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-green-400 font-semibold">
                      +{formatUSD(event.amount)} Distributed
                    </p>
                    <p className="text-gray-400 text-sm">
                      NAV at distribution: {formatUSD(event.nav)}
                    </p>
                  </div>
                  <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{formatDate(event.timestamp)}</span>
                  <a 
                    href={`https://explorer.solana.com/tx/${event.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    View tx ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oracle Info */}
      <div className="mt-8 bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">About NAV Oracle</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Update Frequency</p>
            <p className="text-white">Hourly (on-chain)</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Oracle Address</p>
            <p className="text-white font-mono text-xs">62KRcX...SdCf</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Data Source</p>
            <p className="text-white">Portfolio valuation from project cash flows</p>
          </div>
        </div>
      </div>
    </div>
  );
}
