import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatUSD, formatDate } from '../lib/solana';

/**
 * NAV Chart Component
 * @param {Object} props
 * @param {Array<{nav: number, timestamp: number}>} props.data
 */
export default function NavChart({ data = [] }) {
  // Format data for recharts
  const chartData = data.map(item => ({
    ...item,
    navFormatted: item.nav / 100,
    dateFormatted: formatDate(item.timestamp),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.dateFormatted}</p>
          <p className="text-green-400 font-bold">{formatUSD(payload[0].payload.nav)}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No NAV history available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#374151' }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#374151' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="navFormatted" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
