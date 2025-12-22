import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, RefreshCw, ArrowRight, Shield, Zap, BarChart3, Leaf, Wind, Battery } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FundStatsGrid } from '../components/StatCard';
import NavChart from '../components/NavChart';
import AnimatedBackground from '../components/AnimatedBackground';
import { useReiToken } from '../lib/useReiToken';
import { toDisplayAmount } from '../lib/types';

export default function HomePage() {
  const { data, loading, refresh } = useReiToken();

  // Refresh NAV on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Convert on-chain values for display
  const currentNav = toDisplayAmount(data?.currentNav || 0, 2);
  const tokenSupply = toDisplayAmount(data?.tokenSupply || 0, 6);
  const treasuryBalance = toDisplayAmount(data?.treasuryBalance || 0, 6);

  // Mock history for chart until we have real history
  const navHistory = data?.currentNav ? [
    { timestamp: Date.now() - 86400000 * 6, nav: (data.currentNav * 0.98) / 100 },
    { timestamp: Date.now() - 86400000 * 5, nav: (data.currentNav * 0.985) / 100 },
    { timestamp: Date.now() - 86400000 * 4, nav: (data.currentNav * 0.99) / 100 },
    { timestamp: Date.now() - 86400000 * 3, nav: (data.currentNav * 0.995) / 100 },
    { timestamp: Date.now() - 86400000 * 2, nav: (data.currentNav * 0.998) / 100 },
    { timestamp: Date.now() - 86400000, nav: (data.currentNav * 0.999) / 100 },
    { timestamp: Date.now(), nav: data.currentNav / 100 },
  ] : [];

  // Fund stats for the grid
  const fundStats = {
    currentNav: data?.currentNav || 0,
    totalAum: treasuryBalance,
    totalSupply: tokenSupply,
    navChange24h: 0.2,
    ytdYield: 7.2,
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <AnimatedBackground variant="hero" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative group">
              <img
                src="/logo.png"
                alt="Renewra"
                className="h-24 w-24 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-fade-in-up">
            Invest in
            <span className="gradient-text text-glow"> Renewable Energy</span>
            <br />
            <span className="text-gray-100">on Solana</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
            Renewra tokenizes real-world solar, wind, and battery storage assets.
            Get exposure to institutional-grade infrastructure with transparent
            NAV and automated yield distribution.
          </p>

          {/* Current NAV Highlight */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 glass rounded-2xl px-6 sm:px-10 py-6 mb-10 animate-fade-in-up delay-300">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm mb-1">Current NAV</p>
              {loading ? (
                <div className="skeleton h-10 w-28 rounded-lg" />
              ) : (
                <p className="text-4xl font-bold gradient-text">
                  ${currentNav.toFixed(2)}
                </p>
              )}
            </div>

            <div className="hidden sm:block h-14 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm mb-1">Total Supply</p>
              {loading ? (
                <div className="skeleton h-10 w-32 rounded-lg" />
              ) : (
                <p className="text-4xl font-bold text-white">
                  {tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-green-400 text-2xl ml-2">REI</span>
                </p>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Link to="/subscribe">
              <Button variant="gradient" size="xl" className="w-full sm:w-auto group">
                Subscribe Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                View Projects
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-in delay-500">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Audited Smart Contracts</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Instant Settlement</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Transparent NAV</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Fund Overview</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="text-gray-400"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <FundStatsGrid stats={fundStats} loading={loading} />
      </section>

      {/* NAV Chart Section */}
      <section className="relative max-w-7xl mx-auto px-4 pb-16">
        <div className="card-premium p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">NAV Performance</h2>
            <Link to="/nav-history" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              View History →
            </Link>
          </div>
          <NavChart data={navHistory} />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Three simple steps to start investing in renewable energy infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50" />

          {[
            {
              icon: Wallet,
              title: 'Subscribe with USDC',
              description: 'Deposit USDC and receive REI tokens at the current NAV price. Minimal 0.5% mint fee.',
              step: '01',
            },
            {
              icon: TrendingUp,
              title: 'Earn Yield',
              description: 'Your tokens represent ownership in renewable energy projects. Yield is distributed pro-rata automatically.',
              step: '02',
            },
            {
              icon: RefreshCw,
              title: 'Redeem Anytime',
              description: 'Request redemption to convert REI tokens back to USDC at the current NAV price.',
              step: '03',
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="relative text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl font-bold text-green-500/10">
                {item.step}
              </div>

              {/* Icon */}
              <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                <item.icon className="w-10 h-10 text-green-400 group-hover:text-green-300 transition-colors" />
                <div className="absolute inset-0 rounded-2xl bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Asset Types */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Diversified Energy Portfolio</h2>
          <p className="text-gray-400">Backed by real-world renewable energy infrastructure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Leaf, label: 'Solar', color: 'yellow', description: 'Photovoltaic installations generating clean electricity' },
            { icon: Wind, label: 'Wind', color: 'blue', description: 'Onshore wind farms harnessing natural wind power' },
            { icon: Battery, label: 'Storage', color: 'purple', description: 'Battery systems for grid stability and peak shaving' },
          ].map((asset, index) => (
            <div
              key={asset.label}
              className="card-premium p-6 text-center group hover:border-gray-600 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${asset.color === 'yellow' ? 'bg-yellow-500/10' :
                  asset.color === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                }`}>
                <asset.icon className={`w-8 h-8 ${asset.color === 'yellow' ? 'text-yellow-500' :
                    asset.color === 'blue' ? 'text-blue-500' : 'text-purple-500'
                  }`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{asset.label}</h3>
              <p className="text-gray-400 text-sm">{asset.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Powered By */}
      <section className="relative max-w-7xl mx-auto px-4 py-16 pb-20">
        <div className="card-premium p-8 text-center">
          <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {['Solana', 'Anchor', 'SPL Token'].map((tech) => (
              <span
                key={tech}
                className="text-2xl md:text-3xl font-bold text-gray-600 hover:text-gray-400 transition-colors duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
