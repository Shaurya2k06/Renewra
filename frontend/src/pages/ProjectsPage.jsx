import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import ProjectCard from '../components/ProjectCard';
import { MOCK_PROJECTS } from '../lib/mockData';
import { PROJECT_TYPES } from '../lib/types';
import { formatCompact } from '../lib/solana';

export default function ProjectsPage() {
  // Aggregate stats by project type
  const typeStats = MOCK_PROJECTS.reduce((acc, project) => {
    if (!acc[project.type]) {
      acc[project.type] = { capacity: 0, valuation: 0, revenue: 0 };
    }
    acc[project.type].capacity += project.capacity_mw;
    acc[project.type].valuation += project.valuation;
    acc[project.type].revenue += project.annual_revenue;
    return acc;
  }, {});

  const pieData = Object.entries(typeStats).map(([type, stats]) => ({
    name: PROJECT_TYPES[type]?.label || type,
    value: stats.valuation,
    color: PROJECT_TYPES[type]?.color || '#888',
  }));

  const barData = Object.entries(typeStats).map(([type, stats]) => ({
    name: PROJECT_TYPES[type]?.label || type,
    revenue: stats.revenue / 1000000,
    color: PROJECT_TYPES[type]?.color || '#888',
  }));

  const totalCapacity = MOCK_PROJECTS.reduce((sum, p) => sum + p.capacity_mw, 0);
  const totalValuation = MOCK_PROJECTS.reduce((sum, p) => sum + p.valuation, 0);
  const totalRevenue = MOCK_PROJECTS.reduce((sum, p) => sum + p.annual_revenue, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Projects</h1>
        <p className="text-gray-400">
          Real-world renewable energy assets backing REI tokens
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Total Capacity</p>
          <p className="text-2xl font-bold text-white">{totalCapacity} MW</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Total Valuation</p>
          <p className="text-2xl font-bold text-white">${formatCompact(totalValuation)}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Annual Revenue</p>
          <p className="text-2xl font-bold text-green-400">${formatCompact(totalRevenue)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Allocation Pie Chart */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Allocation by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${formatCompact(value)}`}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Annual Revenue by Type ($M)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6b7280" 
                  tick={{ fill: '#9ca3af' }} 
                  width={80}
                />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(1)}M`}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="revenue" 
                  radius={[0, 4, 4, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <h2 className="text-2xl font-bold text-white mb-6">All Projects</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
