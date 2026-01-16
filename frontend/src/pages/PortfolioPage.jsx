import { useState, useEffect } from 'react';
import VideoBackground from '../components/VideoBackground';
import NavChart from '../components/NavChart';
import ProjectCard from '../components/ProjectCard';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useStore } from '../lib/store';
import { fetchProjects, fetchNav, checkOracleHealth } from '../lib/oracleApi';
import { MOCK_PROJECTS } from '../lib/mockData';
import { formatUSD, formatCompact, formatDate } from '../lib/solana';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {
    Building2,
    History,
    Zap,
    DollarSign,
    TrendingUp,
    Clock,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Wifi,
    WifiOff
} from 'lucide-react';
import { PROJECT_TYPES } from '../lib/types';

export default function PortfolioPage() {
    const [activeTab, setActiveTab] = useState('assets');
    const { navHistory, fundStats, refreshNavHistory } = useStore();

    // Oracle data state
    const [projects, setProjects] = useState([]);
    const [oracleConnected, setOracleConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openProjectModal = (project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const closeProjectModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    useEffect(() => {
        refreshNavHistory();
        loadProjectsData();
    }, []);

    const loadProjectsData = async () => {
        setLoading(true);

        // Check if oracle is available
        const isHealthy = await checkOracleHealth();
        setOracleConnected(isHealthy);

        if (isHealthy) {
            const oracleProjects = await fetchProjects();
            if (oracleProjects && oracleProjects.length > 0) {
                // Transform oracle data to match ProjectCard expected format
                const transformedProjects = oracleProjects.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    location: p.location,
                    capacity_mw: p.capacity_mw || p.capacity_mwh || 0,
                    valuation: p.dcf_valuation,
                    annual_revenue: p.annual_revenue || 0,
                    irr: ((p.annual_revenue / p.dcf_valuation) * 100).toFixed(1),
                    offtaker: 'PPA Contract',
                    completion_year: p.commission_date?.split('-')[0] || 'N/A',
                    status: p.status,
                    // New oracle fields for price display
                    ppa_price: p.price_display,
                    cash_flow_this_month: p.cash_flow_this_month,
                    ppa_price_per_kwh: p.ppa_price_per_kwh,
                    ppa_price_per_mwh: p.ppa_price_per_mwh
                }));
                setProjects(transformedProjects);
            } else {
                // Fallback to mock data
                setProjects(MOCK_PROJECTS);
            }
        } else {
            // Oracle not available, use mock data
            setProjects(MOCK_PROJECTS);
        }

        setLoading(false);
    };

    // --- Asset Data Preparation ---
    const typeStats = projects.reduce((acc, project) => {
        if (!acc[project.type]) {
            acc[project.type] = { capacity: 0, valuation: 0, revenue: 0 };
        }
        acc[project.type].capacity += project.capacity_mw || 0;
        acc[project.type].valuation += project.valuation || 0;
        acc[project.type].revenue += project.annual_revenue || 0;
        return acc;
    }, {});

    const pieData = Object.entries(typeStats).map(([type, stats]) => ({
        name: PROJECT_TYPES[type]?.label || type,
        value: stats.valuation,
        color: '#F5F5F7',
        opacity: type === 'solar' ? 1.0 : type === 'wind' ? 0.7 : 0.4,
    }));

    const barData = Object.entries(typeStats).map(([type, stats]) => ({
        name: PROJECT_TYPES[type]?.label || type,
        revenue: stats.revenue / 1000000,
        color: '#F5F5F7',
        opacity: type === 'solar' ? 1.0 : type === 'wind' ? 0.7 : 0.4,
    }));

    const totalCapacity = projects.reduce((sum, p) => sum + (p.capacity_mw || 0), 0);
    const totalValuation = projects.reduce((sum, p) => sum + (p.valuation || 0), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.annual_revenue || 0), 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel rounded-xl px-4 py-3 shadow-xl border border-white/10">
                    <p className="text-white font-medium mb-1">{payload[0].payload.name || label}</p>
                    <p className="text-white/80 font-semibold">
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

    // --- Performance/NAV Data Preparation ---
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
        <div className="relative min-h-screen py-24 md:py-32">
            <VideoBackground overlayOpacity={0.8} />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12 animate-reveal">
                    <h1 className="text-hero text-white mb-6">Fund Portfolio</h1>
                    <p className="text-body-large text-white/60 max-w-2xl mx-auto">
                        Transparent breakdown of underlying renewable assets and historical performance data.
                    </p>

                    {/* Oracle Status Indicator */}
                    <div className="flex justify-center mt-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${oracleConnected
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-white/5 border border-white/10 text-white/40'
                            }`}>
                            {oracleConnected ? (
                                <>
                                    <Wifi className="w-4 h-4" />
                                    <span>Live Oracle Data</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4" />
                                    <span>Using Cached Data</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12 animate-reveal delay-100">
                    <div className="glass-panel p-1 rounded-2xl inline-flex">
                        <button
                            onClick={() => setActiveTab('assets')}
                            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'assets'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Holdings & Assets
                        </button>
                        <button
                            onClick={() => setActiveTab('performance')}
                            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'performance'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            Fund Performance
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="animate-reveal delay-200">
                    {loading ? (
                        <div className="glass-panel p-16 rounded-3xl text-center">
                            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white/60">Loading portfolio data...</p>
                        </div>
                    ) : activeTab === 'assets' ? (
                        <>
                            {/* Asset Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                                {[
                                    { label: 'Total Capacity', value: `${totalCapacity} MW`, icon: Zap },
                                    { label: 'Total Valuation', value: `$${formatCompact(totalValuation)}`, icon: DollarSign },
                                    { label: 'Annual Revenue', value: `$${formatCompact(totalRevenue)}`, icon: TrendingUp },
                                ].map((stat, index) => (
                                    <div
                                        key={stat.label}
                                        className="glass-panel p-8 rounded-3xl animate-reveal group"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-white/40 text-sm uppercase tracking-wider mb-2">{stat.label}</p>
                                        <p className="text-4xl font-bold text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Charts */}
                            <div className="grid md:grid-cols-2 gap-8 mb-16">
                                {/* Allocation Pie Chart */}
                                <div className="glass-panel p-8 rounded-3xl animate-reveal delay-300">
                                    <h3 className="text-xl font-bold text-white mb-8">Asset Allocation</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            fillOpacity={entry.opacity}
                                                            className="transition-all hover:opacity-100 cursor-pointer"
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex justify-center gap-8 mt-6">
                                        {pieData.map((item) => (
                                            <div key={item.name} className="flex items-center gap-2 group cursor-pointer">
                                                <div
                                                    className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                                                    style={{ backgroundColor: item.color, opacity: item.opacity }}
                                                />
                                                <span className="text-white/60 text-sm group-hover:text-white transition-colors">
                                                    {item.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Revenue Bar Chart */}
                                <div className="glass-panel p-8 rounded-3xl animate-reveal delay-400">
                                    <h3 className="text-xl font-bold text-white mb-8">Revenue by Type ($M)</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={barData} layout="vertical">
                                                <XAxis
                                                    type="number"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 }}
                                                    width={80}
                                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar
                                                    dataKey="revenue"
                                                    radius={[0, 4, 4, 0]}
                                                    barSize={32}
                                                >
                                                    {barData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                            fillOpacity={entry.opacity}
                                                            className="hover:opacity-100 transition-all cursor-pointer"
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Project List */}
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Active Projects</h2>
                                    <p className="text-white/40">
                                        Detailed view of all renewable energy assets in the portfolio.
                                        {oracleConnected && <span className="text-green-400 ml-2">• Prices from Oracle</span>}
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((project, index) => (
                                        <div
                                            key={project.id}
                                            className="animate-reveal"
                                            style={{ animationDelay: `${500 + index * 100}ms` }}
                                        >
                                            <ProjectCard project={project} showPrice={oracleConnected} onClick={openProjectModal} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        // --- Performance Tab Content ---
                        <div className="max-w-6xl mx-auto">
                            {/* Performance Header */}
                            <div className="glass-panel p-8 rounded-3xl mb-12">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-5 h-5 text-white/40" />
                                            <p className="text-white/40 text-sm uppercase tracking-wider">Current NAV</p>
                                        </div>
                                        <p className="text-5xl font-bold text-white">{formatUSD(currentNav)}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-12">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-white/40" />
                                                <p className="text-white/40 text-sm uppercase tracking-wider">24h Change</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {change24h && parseFloat(change24h) >= 0 ? (
                                                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                                                )}
                                                <p className={`text-2xl font-bold ${change24h && parseFloat(change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {change24h ? `${parseFloat(change24h) >= 0 ? '+' : ''}${change24h}%` : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-white/40" />
                                                <p className="text-white/40 text-sm uppercase tracking-wider">30d Change</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {change30d && parseFloat(change30d) >= 0 ? (
                                                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                                                )}
                                                <p className={`text-2xl font-bold ${change30d && parseFloat(change30d) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {change30d ? `${parseFloat(change30d) >= 0 ? '+' : ''}${change30d}%` : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-white/40" />
                                                <p className="text-white/40 text-sm uppercase tracking-wider">Last Update</p>
                                            </div>
                                            <p className="text-xl text-white font-medium mt-1">
                                                {fundStats?.lastNavUpdate ? formatDate(fundStats.lastNavUpdate) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 h-[350px]">
                                    <NavChart data={navHistory} height="100%" />
                                </div>
                            </div>

                            {/* History Table */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="glass-panel p-8 rounded-3xl">
                                    <h2 className="text-xl font-bold text-white mb-6">NAV Snapshots</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                                                    <th className="pb-4 font-medium">Date</th>
                                                    <th className="pb-4 font-medium">NAV</th>
                                                    <th className="pb-4 font-medium text-right">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {navHistory.slice().reverse().map((snapshot, index, arr) => {
                                                    const prevNav = arr[index + 1]?.nav || snapshot.nav;
                                                    const change = ((snapshot.nav - prevNav) / prevNav * 100).toFixed(2);
                                                    const isPositive = parseFloat(change) >= 0;

                                                    return (
                                                        <tr key={snapshot.timestamp} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="py-4 text-white/60 text-sm">
                                                                {formatDate(snapshot.timestamp)}
                                                            </td>
                                                            <td className="py-4 text-white font-medium">
                                                                {formatUSD(snapshot.nav)}
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isPositive
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

                                <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                                        <TrendingUp className="w-8 h-8 text-white/40" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-4">Yield Distributions</h2>
                                    <p className="text-white/40 max-w-sm leading-relaxed">
                                        Yield distributions will be recorded here when the fund starts generating returns from renewable energy projects.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Detail Modal */}
            <ProjectDetailModal
                project={selectedProject}
                isOpen={isModalOpen}
                onClose={closeProjectModal}
            />
        </div>
    );
}
