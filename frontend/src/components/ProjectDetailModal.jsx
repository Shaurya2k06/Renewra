import { useState, useEffect } from 'react';
import { X, MapPin, Zap, DollarSign, TrendingUp, Calendar, Activity, BarChart3, Sun, Wind, Battery } from 'lucide-react';
import { PROJECT_TYPES } from '../lib/types';
import { formatCompact, formatUSD } from '../lib/solana';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Project Detail Modal - Shows comprehensive project information
 */
export default function ProjectDetailModal({ project, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !project) return null;

    const typeInfo = PROJECT_TYPES[project.type] || PROJECT_TYPES.solar;

    // Generate mock historical data for charts
    const generateProductionData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const baseProduction = project.annual_revenue ? project.annual_revenue / 12 : 500000;

        return months.map((month, i) => {
            // Simulate seasonal variation (higher in summer for solar)
            const seasonalFactor = project.type === 'solar'
                ? 0.6 + 0.8 * Math.sin((i - 2) * Math.PI / 6)
                : 0.8 + 0.4 * Math.random();

            return {
                month,
                production: Math.round(baseProduction * seasonalFactor * (0.9 + Math.random() * 0.2)),
                target: Math.round(baseProduction * seasonalFactor)
            };
        });
    };

    const generateRevenueData = () => {
        const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'];
        const baseRevenue = project.annual_revenue ? project.annual_revenue / 4 : 1000000;

        return quarters.map((quarter, i) => ({
            quarter,
            revenue: Math.round(baseRevenue * (0.95 + i * 0.02 + Math.random() * 0.1)),
            expenses: Math.round(baseRevenue * 0.3 * (0.9 + Math.random() * 0.2))
        }));
    };

    const productionData = generateProductionData();
    const revenueData = generateRevenueData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel rounded-xl px-4 py-3 shadow-xl border border-white/10">
                    <p className="text-white font-medium mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-white/80 text-sm">
                            {entry.name}: ${formatCompact(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Calculate metrics
    const monthlyRevenue = project.annual_revenue ? project.annual_revenue / 12 : 0;
    const estimatedYield = project.valuation ? ((project.annual_revenue / project.valuation) * 100).toFixed(1) : 'N/A';
    const capacityFactor = project.type === 'solar' ? '22%' : project.type === 'wind' ? '35%' : '85%';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/10 shadow-2xl animate-reveal">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-[#0A0A0A]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            {typeInfo.icon}
                        </div>
                        <div>
                            <span className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 uppercase tracking-widest">
                                {typeInfo.label}
                            </span>
                            <h2 className="text-2xl font-bold text-white mt-2">{project.name}</h2>
                            <div className="flex items-center gap-2 text-white/40 text-sm mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{project.location}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 md:px-8 pt-6 border-b border-white/5">
                    {['overview', 'production', 'financials'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab
                                    ? 'text-white border-white'
                                    : 'text-white/40 border-transparent hover:text-white/60'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-220px)]">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Capacity', value: `${project.capacity_mw} MW`, icon: Zap },
                                    { label: 'Valuation', value: `$${formatCompact(project.valuation)}`, icon: DollarSign },
                                    { label: 'Annual Revenue', value: `$${formatCompact(project.annual_revenue)}`, icon: TrendingUp },
                                    { label: 'Capacity Factor', value: capacityFactor, icon: Activity },
                                ].map((stat, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <stat.icon className="w-4 h-4 text-white/40" />
                                            <p className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Status & Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Status', value: project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Operational' },
                                            { label: 'Commission Date', value: project.completion_year || 'N/A' },
                                            { label: 'Estimated Yield', value: `${estimatedYield}%` },
                                            { label: 'PPA Price', value: project.ppa_price || 'Contract Price' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="text-white/40">{item.label}</span>
                                                <span className="text-white font-medium">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">Monthly Performance</h3>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={productionData.slice(-6)}>
                                                <defs>
                                                    <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                                <YAxis hide />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="production" stroke="#ffffff" strokeWidth={2} fill="url(#productionGradient)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'production' && (
                        <div className="space-y-8">
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Annual Production Trend</h3>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-white" />
                                            <span className="text-white/60">Actual</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-white/30" />
                                            <span className="text-white/60">Target</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={productionData}>
                                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} tickFormatter={(v) => `$${formatCompact(v)}`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                            <Line type="monotone" dataKey="production" stroke="#ffffff" strokeWidth={2} dot={{ fill: '#ffffff', strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Production Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Peak Month', value: 'July', sub: 'Highest output' },
                                    { label: 'Avg Monthly', value: `$${formatCompact(monthlyRevenue)}`, sub: 'Revenue' },
                                    { label: 'YTD Performance', value: '+3.2%', sub: 'vs Target' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-white/30 text-xs mt-1">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-8">
                            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Quarterly Revenue & Expenses</h3>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <XAxis dataKey="quarter" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                                            <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} tickFormatter={(v) => `$${formatCompact(v)}`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="revenue" fill="#ffffff" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Revenue" />
                                            <Bar dataKey="expenses" fill="#ffffff" fillOpacity={0.3} radius={[4, 4, 0, 0]} name="Expenses" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">Revenue Breakdown</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Gross Revenue', value: `$${formatCompact(project.annual_revenue)}` },
                                            { label: 'Operating Expenses', value: `-$${formatCompact(project.annual_revenue * 0.25)}` },
                                            { label: 'Net Operating Income', value: `$${formatCompact(project.annual_revenue * 0.75)}` },
                                        ].map((item, i) => (
                                            <div key={i} className={`flex justify-between ${i === 2 ? 'pt-4 border-t border-white/5' : ''}`}>
                                                <span className="text-white/40">{item.label}</span>
                                                <span className={`font-medium ${i === 1 ? 'text-white/60' : 'text-white'}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">Investment Metrics</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'DCF Valuation', value: `$${formatCompact(project.valuation)}` },
                                            { label: 'Annual Yield', value: `${estimatedYield}%` },
                                            { label: 'Payback Period', value: `${Math.round(project.valuation / project.annual_revenue)} years` },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="text-white/40">{item.label}</span>
                                                <span className="text-white font-medium">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
