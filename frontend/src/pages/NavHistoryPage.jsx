import { useEffect } from 'react';
import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import NavChart from '../components/NavChart';
import { useStore } from '../lib/store';
import { formatUSD, formatDate } from '../lib/solana';

export default function NavHistoryPage() {
  const { navHistory, fundStats, refreshNavHistory } = useStore();

  useEffect(() => {
    // Refresh nav history on mount
    refreshNavHistory();
  }, []);

  // Calculate percentage changes from actual NAV history
  const calculateChange = (currentNav, daysAgo) => {
    if (!navHistory || navHistory.length < 2) return null;
    
    const targetTime = Date.now() - (daysAgo * 86400000);
    const historicalSnapshot = navHistory.find(snap => snap.timestamp <= targetTime) || navHistory[0];
    
    if (!historicalSnapshot || historicalSnapshot.nav === 0) return null;
    
    const change = ((currentNav - historicalSnapshot.nav) / historicalSnapshot.nav) * 100;
    return change.toFixed(2);
  };

  const currentNav = fundStats?.currentNav || navHistory[navHistory.length - 1]?.nav || 0;
  const change24h = calculateChange(currentNav, 1);
  const change30d = calculateChange(currentNav, 30);

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
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-green-400" />
              <p className="text-green-400 text-sm font-medium">Current NAV</p>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatUSD(currentNav)}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-gray-400 text-sm">24h Change</p>
              </div>
              <p className={`font-semibold ${change24h && parseFloat(change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change24h ? `${parseFloat(change24h) >= 0 ? '+' : ''}${change24h}%` : 'N/A'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <p className="text-gray-400 text-sm">30d Change</p>
              </div>
              <p className={`font-semibold ${change30d && parseFloat(change30d) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change30d ? `${parseFloat(change30d) >= 0 ? '+' : ''}${change30d}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Update</p>
              <p className="text-white font-medium">
                {fundStats?.lastNavUpdate ? formatDate(fundStats.lastNavUpdate) : 'N/A'}
              </p>
            </div>
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
          <div className="text-center py-8">
            <p className="text-gray-400">
              Yield distributions will be recorded here when the fund starts generating returns from renewable energy projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
