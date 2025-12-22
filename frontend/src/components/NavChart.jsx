import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatUSD, formatDate } from '../lib/solana';
import { TrendingUp } from 'lucide-react';

/**
 * Premium NAV Chart Component with gradient area fill
 * @param {Object} props
 * @param {Array<{nav: number, timestamp: number}>} props.data
 */
export default function NavChart({ data = [], height = 280 }) {
  // Format data for recharts
  const chartData = data.map(item => ({
    ...item,
    navFormatted: item.nav / 100,
    dateFormatted: formatDate(item.timestamp),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl px-4 py-3 shadow-xl border border-white/10">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.dateFormatted}</p>
          <p className="text-xl font-bold gradient-text">{formatUSD(payload[0].payload.nav)}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-500">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-gray-600" />
        </div>
        <p>No NAV history available</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="dateFormatted"
            stroke="#374151"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            dy={10}
          />
          <YAxis
            stroke="#374151"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="navFormatted"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            fill="url(#navGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: '#10b981',
              stroke: '#fff',
              strokeWidth: 2,
              className: 'drop-shadow-lg'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
