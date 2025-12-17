import { formatUSD, formatCompact } from '../lib/solana';
import { TrendingUp, Coins, DollarSign, Sprout } from 'lucide-react';

/**
 * Stats Card Component for displaying key metrics
 */
export function StatCard({ label, value, subValue, icon: IconComponent, trend }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-start justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        {IconComponent && <IconComponent className="w-6 h-6 text-gray-500" />}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {subValue && (
        <p className={`text-sm ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {subValue}
        </p>
      )}
    </div>
  );
}

/**
 * Stats Grid for Fund Overview
 */
export function FundStatsGrid({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Current NAV"
        value={formatUSD(stats.currentNav)}
        subValue="+0.54% (30d)"
        trend="up"
        icon={TrendingUp}
      />
      <StatCard
        label="Total Supply"
        value={`${formatCompact(stats.totalSupply)} REI`}
        subValue="Circulating tokens"
        icon={Coins}
      />
      <StatCard
        label="Fund Value"
        value={`$${formatCompact(stats.fundValue)}`}
        subValue="Total AUM"
        icon={DollarSign}
      />
      <StatCard
        label="YTD Yield"
        value={`${stats.ytdYield}%`}
        subValue="Annualized return"
        trend="up"
        icon={Sprout}
      />
    </div>
  );
}

export default StatCard;
