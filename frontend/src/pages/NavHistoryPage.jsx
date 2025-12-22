import { useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import NavChart from '../components/NavChart';
import AnimatedBackground from '../components/AnimatedBackground';
import { useStore } from '../lib/store';
import { formatUSD, formatDate } from '../lib/solana';

export default function NavHistoryPage() {
  const { navHistory, fundStats, refreshNavHistory } = useStore();

  useEffect(() => {
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
    <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
      <AnimatedBackground variant="subtle" />

      <div className="relative">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">NAV History</h1>
          <p className="text-gray-400 text-lg">
            Track the Net Asset Value of the Renewra fund over time
          </p>
        </div>

        {/* Current NAV Card */}
        <div className="card-premium p-6 md:p-8 mb-8 animate-fade-in-up" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            {/* Current NAV */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-green-400 text-sm font-medium">Current NAV</p>
              </div>
              <p className="text-4xl md:text-5xl font-bold gradient-text">
                {formatUSD(currentNav)}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 lg:gap-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-400 text-sm">24h Change</p>
                </div>
                <div className="flex items-center gap-2">
                  {change24h && parseFloat(change24h) >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`text-xl font-bold ${change24h && parseFloat(change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change24h ? `${parseFloat(change24h) >= 0 ? '+' : ''}${change24h}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-400 text-sm">30d Change</p>
                </div>
                <div className="flex items-center gap-2">
                  {change30d && parseFloat(change30d) >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                  )}
                  <p className={`text-xl font-bold ${change30d && parseFloat(change30d) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change30d ? `${parseFloat(change30d) >= 0 ? '+' : ''}${change30d}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-400 text-sm">Last Update</p>
                </div>
                <p className="text-xl text-white font-medium">
                  {fundStats?.lastNavUpdate ? formatDate(fundStats.lastNavUpdate) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <NavChart data={navHistory} height={320} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* NAV Snapshots Table */}
          <div className="card-premium p-6 animate-fade-in-up delay-100" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            <h2 className="text-xl font-semibold text-white mb-6">NAV Snapshots</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-white/5">
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">NAV</th>
                    <th className="pb-4 font-medium text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {navHistory.slice().reverse().map((snapshot, index, arr) => {
                    const prevNav = arr[index + 1]?.nav || snapshot.nav;
                    const change = ((snapshot.nav - prevNav) / prevNav * 100).toFixed(2);
                    const isPositive = parseFloat(change) >= 0;

                    return (
                      <tr
                        key={snapshot.timestamp}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 text-gray-400 text-sm">
                          {formatDate(snapshot.timestamp)}
                        </td>
                        <td className="py-4 text-white font-medium">
                          {formatUSD(snapshot.nav)}
                        </td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                            }`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{change}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yield Distribution History */}
          <div className="card-premium p-6 animate-fade-in-up delay-200" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            <h2 className="text-xl font-semibold text-white mb-6">Yield Distributions</h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-green-400/50" />
              </div>
              <p className="text-gray-400 max-w-xs leading-relaxed">
                Yield distributions will be recorded here when the fund starts generating returns from renewable energy projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
