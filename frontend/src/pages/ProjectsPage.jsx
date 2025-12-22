import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import ProjectCard from '../components/ProjectCard';
import AnimatedBackground from '../components/AnimatedBackground';
import { MOCK_PROJECTS } from '../lib/mockData';
import { PROJECT_TYPES } from '../lib/types';
import { formatCompact } from '../lib/solana';
import { Zap, TrendingUp, DollarSign } from 'lucide-react';

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg px-4 py-3 shadow-xl">
          <p className="text-white font-medium mb-1">{payload[0].payload.name || label}</p>
          <p className="text-green-400 font-semibold">
            {typeof payload[0].value === 'number' && payload[0].value < 100
              ? `$${payload[0].value.toFixed(1)}M`
              : `$${formatCompact(payload[0].value)}`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
      <AnimatedBackground variant="subtle" />

      <div className="relative">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Portfolio Projects</h1>
          <p className="text-gray-400 text-lg">
            Real-world renewable energy assets backing REI tokens
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Capacity', value: `${totalCapacity} MW`, icon: Zap, color: 'yellow' },
            { label: 'Total Valuation', value: `$${formatCompact(totalValuation)}`, icon: DollarSign, color: 'blue' },
            { label: 'Annual Revenue', value: `$${formatCompact(totalRevenue)}`, icon: TrendingUp, color: 'green' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="card-premium p-6 text-center animate-fade-in-up group"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${stat.color === 'yellow' ? 'bg-yellow-500/10' :
                  stat.color === 'blue' ? 'bg-blue-500/10' : 'bg-green-500/10'
                }`}>
                <stat.icon className={`w-6 h-6 ${stat.color === 'yellow' ? 'text-yellow-400' :
                    stat.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                  }`} />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Allocation Pie Chart */}
          <div className="card-premium p-6 animate-fade-in-up delay-300" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            <h3 className="text-lg font-semibold text-white mb-6">Allocation by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 group cursor-pointer">
                  <div
                    className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div className="card-premium p-6 animate-fade-in-up delay-400" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            <h3 className="text-lg font-semibold text-white mb-6">Annual Revenue by Type ($M)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis
                    type="number"
                    stroke="#4b5563"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#4b5563"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    width={80}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    radius={[0, 8, 8, 0]}
                    className="transition-opacity"
                  >
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="mb-8 animate-fade-in delay-500" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <h2 className="text-2xl font-bold text-white mb-2">All Projects</h2>
          <p className="text-gray-400 mb-6">{MOCK_PROJECTS.length} active renewable energy assets</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROJECTS.map((project, index) => (
            <div
              key={project.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${500 + index * 100}ms`,
                animationFillMode: 'forwards',
                opacity: 0
              }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
