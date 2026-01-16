import { PROJECT_TYPES } from '../lib/types';
import { formatCompact } from '../lib/solana';
import { MapPin, TrendingUp, DollarSign, ArrowUpRight, Zap } from 'lucide-react';

/**
 * Glassmorphism Project Card with Oracle Price Display
 * @param {Object} props
 * @param {Object} props.project - Project data
 * @param {boolean} props.showPrice - Whether to show PPA pricing from oracle
 */
export default function ProjectCard({ project, showPrice = false }) {
  const typeInfo = PROJECT_TYPES[project.type] || PROJECT_TYPES.solar;

  // Format PPA price for display
  const getPriceDisplay = () => {
    if (project.ppa_price) return project.ppa_price;
    if (project.ppa_price_per_kwh) return `$${project.ppa_price_per_kwh.toFixed(3)}/kWh`;
    if (project.ppa_price_per_mwh) return `$${project.ppa_price_per_mwh.toFixed(0)}/MWh`;
    return null;
  };

  const priceDisplay = getPriceDisplay();

  return (
    <div className="group relative glass-panel p-8 rounded-3xl hover:bg-white/[0.08] transition-all duration-500 overflow-hidden">

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              {typeInfo.icon}
            </div>
            <div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 uppercase tracking-widest">
                {typeInfo.label}
              </span>
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
            <ArrowUpRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Name & Location */}
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-white/90 transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center gap-2 text-white/40 text-sm mb-6">
          <MapPin className="w-4 h-4" />
          <span>{project.location}</span>
        </div>

        {/* Oracle Price Badge - NEW! */}
        {showPrice && priceDisplay && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-xs uppercase tracking-wider font-medium">PPA Price</span>
              </div>
              <span className="text-green-400 font-bold text-lg">{priceDisplay}</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Capacity</p>
            <p className="text-white font-semibold text-lg">{project.capacity_mw} MW</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Valuation</p>
            <p className="text-white font-semibold text-lg">${formatCompact(project.valuation)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-white font-semibold text-lg">${formatCompact(project.annual_revenue)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
              {project.cash_flow_this_month !== undefined ? 'Monthly CF' : 'IRR'}
            </p>
            <div className="flex items-center gap-1.5">
              {project.cash_flow_this_month !== undefined ? (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <p className="text-white font-semibold text-lg">${formatCompact(project.cash_flow_this_month * 12)}</p>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-white" />
                  <p className="text-white font-semibold text-lg">{project.irr}%</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Status</p>
            <p className={`text-sm font-medium ${project.status === 'operational' ? 'text-green-400' :
                project.status === 'construction' ? 'text-yellow-400' : 'text-white/60'
              }`}>
              {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">COD</p>
            <p className="text-white/80 text-sm font-medium">{project.completion_year}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
