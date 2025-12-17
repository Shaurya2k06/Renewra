import { PROJECT_TYPES } from '../lib/types';
import { formatCompact } from '../lib/solana';

/**
 * @param {Object} props
 * @param {import('../lib/types').Project} props.project
 */
export default function ProjectCard({ project }) {
  const typeInfo = PROJECT_TYPES[project.type] || PROJECT_TYPES.solar;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-2xl mr-2">{typeInfo.icon}</span>
          <span 
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
        </div>
        <span className="text-green-400 font-semibold">{project.irr}% IRR</span>
      </div>

      {/* Name & Location */}
      <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{project.location}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Capacity</p>
          <p className="text-white font-medium">{project.capacity_mw} MW</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Valuation</p>
          <p className="text-white font-medium">${formatCompact(project.valuation)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Annual Revenue</p>
          <p className="text-white font-medium">${formatCompact(project.annual_revenue)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">COD Year</p>
          <p className="text-white font-medium">{project.completion_year}</p>
        </div>
      </div>

      {/* Offtaker */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Offtaker</p>
        <p className="text-gray-300 text-sm">{project.offtaker}</p>
      </div>
    </div>
  );
}
