import { PROJECT_TYPES } from '../lib/types';
import { formatCompact } from '../lib/solana';
import { MapPin, TrendingUp, Calendar, Building } from 'lucide-react';

/**
 * Premium Project Card with glassmorphism and hover effects
 * @param {Object} props
 * @param {import('../lib/types').Project} props.project
 */
export default function ProjectCard({ project }) {
  const typeInfo = PROJECT_TYPES[project.type] || PROJECT_TYPES.solar;

  return (
    <div className="group relative card-premium p-6 hover-lift overflow-hidden">
      {/* Gradient border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl" style={{
          background: `linear-gradient(135deg, ${typeInfo.color}20 0%, transparent 50%)`,
        }} />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="text-3xl p-2 rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${typeInfo.color}15` }}
            >
              {typeInfo.icon}
            </div>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${typeInfo.color}15`,
                color: typeInfo.color,
                border: `1px solid ${typeInfo.color}30`
              }}
            >
              {typeInfo.label}
            </span>
          </div>

          {/* IRR Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 font-bold text-sm">{project.irr}%</span>
          </div>
        </div>

        {/* Name & Location */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
          {project.name}
        </h3>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-5">
          <MapPin className="w-4 h-4" />
          <span>{project.location}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/8 transition-colors">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Capacity</p>
            <p className="text-white font-semibold">{project.capacity_mw} MW</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/8 transition-colors">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Valuation</p>
            <p className="text-white font-semibold">${formatCompact(project.valuation)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/8 transition-colors">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-white font-semibold">${formatCompact(project.annual_revenue)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/8 transition-colors">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">COD</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-white font-semibold">{project.completion_year}</p>
            </div>
          </div>
        </div>

        {/* Offtaker */}
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Offtaker</p>
              <p className="text-gray-300 text-sm font-medium">{project.offtaker}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
