import { formatUSD, formatCompact } from '../lib/solana';
import { TrendingUp, TrendingDown, Coins, DollarSign, Sprout, BarChart3, Wallet, Clock } from 'lucide-react';

/**
 * Premium Stats Card Component with glassmorphism and glow effects
 */
export function StatCard({ label, value, subValue, icon: IconComponent, trend, className = '' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div className={`group relative card-premium p-6 hover-lift ${className}`}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-gray-400 text-sm font-medium">{label}</span>
          {IconComponent && (
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 group-hover:from-green-500/30 group-hover:to-emerald-500/20 transition-all duration-300">
              <IconComponent className="w-5 h-5 text-green-400" />
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
          {value}
        </p>

        {/* Sub value with trend */}
        {subValue && (
          <div className="flex items-center gap-2">
            {TrendIcon && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trend === 'up'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
                }`}>
                <TrendIcon className="w-3 h-3" />
              </div>
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-400' :
                trend === 'down' ? 'text-red-400' :
                  'text-gray-500'
              }`}>
              {subValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact stat display for inline use
 */
export function StatBadge({ label, value, icon: IconComponent }) {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl glass-light">
      {IconComponent && (
        <IconComponent className="w-4 h-4 text-green-400" />
      )}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
    </div>
  );
}

/**
 * Stats Grid for Fund Overview with staggered animations
 */
export function FundStatsGrid({ stats, loading = false }) {
  if (!stats) return null;

  const statItems = [
    {
      label: 'Current NAV',
      value: formatUSD(stats.currentNav),
      subValue: '+0.54% (30d)',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Total Supply',
      value: `${formatCompact(stats.totalSupply)} REI`,
      subValue: 'Circulating tokens',
      icon: Coins,
    },
    {
      label: 'Fund Value',
      value: `$${formatCompact(stats.fundValue)}`,
      subValue: 'Total AUM',
      icon: DollarSign,
    },
    {
      label: 'YTD Yield',
      value: `${stats.ytdYield}%`,
      subValue: 'Annualized return',
      trend: 'up',
      icon: Sprout,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <div
          key={stat.label}
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        >
          {loading ? (
            <div className="card-premium p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-32 mb-2" />
              <div className="skeleton h-4 w-20" />
            </div>
          ) : (
            <StatCard {...stat} />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Large hero stat display
 */
export function HeroStat({ label, value, icon: IconComponent }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 mb-4">
        {IconComponent && <IconComponent className="w-7 h-7 text-green-400" />}
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

// Export icons for use in other components
export { BarChart3, Wallet as WalletIcon, Clock, Coins };

export default StatCard;
