import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, RefreshCw, ArrowRight, Shield, Zap, BarChart3, Leaf, Wind, Battery, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FundStatsGrid } from '../components/StatCard';
import NavChart from '../components/NavChart';
import AnimatedBackground from '../components/AnimatedBackground';
import { useReiToken } from '../lib/useReiToken';
import { toDisplayAmount } from '../lib/types';
import { formatCompact } from '../lib/solana';

// Intersection Observer Hook for scroll animations
function useOnScreen(options) {
  const ref = useRef(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect(); // Only animate once
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, options]);

  return [ref, isVisible];
}

const RevealSection = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useOnScreen({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function HomePage() {
  const { data, loading, refresh } = useReiToken();
  const [scrollPos, setScrollPos] = useState(0);

  // Refresh NAV on mount and track scroll for parallax
  useEffect(() => {
    refresh();

    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-4 overflow-hidden">
        <AnimatedBackground variant="hero" />

        {/* Parallax Content Container */}
        <div
          className="relative max-w-5xl mx-auto text-center z-10"
          style={{ transform: `translateY(${scrollPos * 0.2}px)`, opacity: 1 - Math.min(1, scrollPos / 700) }}
        >
          {/* Animated Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-1000 scale-150" />
              <img
                src="/logo.png"
                alt="Renewra"
                className="relative h-28 w-28 md:h-32 md:w-32 transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-none animate-reveal">
            Invest in
            <span className="block mt-2 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
              Renewable Energy
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto animate-reveal delay-200 font-light leading-relaxed">
            The first on-chain fund for tokenized solar, wind, and storage assets.
            Institutional-grade infrastructure with transparent NAV.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-reveal delay-300">
            <Link to="/invest">
              <Button size="xl" className="w-full sm:w-auto min-w-[200px] h-14 text-lg bg-white text-black hover:bg-white/90 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                Start Investing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="outline" size="xl" className="w-full sm:w-auto min-w-[200px] h-14 text-lg rounded-full border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                View Strategy
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-300"
          style={{ opacity: 1 - Math.min(1, scrollPos / 200) }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </div>
      </section>

      {/* Stats Ticker / Impact Section */}
      <section className="relative z-20 -mt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Fund Performance</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                  className="text-white/40 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Live Data
                </Button>
              </div>
              <FundStatsGrid stats={fundStats} loading={loading} />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="relative max-w-7xl mx-auto px-4 py-32">
        <RevealSection>
          <div className="text-center mb-24">
            <span className="text-green-400 text-sm font-bold tracking-widest uppercase mb-4 block">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">
              Seamlessly bridge decentralized finance with real-world energy infrastructure
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {[
            {
              icon: Wallet,
              title: 'Subscribe',
              description: 'Deposit USDC to mint REI tokens representing your share of the fund.',
              step: '01',
              color: 'text-blue-400'
            },
            {
              icon: Zap,
              title: 'Generate',
              description: 'Assets generate revenue from electricity sales, accruing value to the NAV.',
              step: '02',
              color: 'text-yellow-400'
            },
            {
              icon: TrendingUp,
              title: 'Grow',
              description: 'Redeem anytime at current NAV or hold for long-term appreciation.',
              step: '03',
              color: 'text-green-400'
            },
          ].map((item, index) => (
            <RevealSection key={item.title} delay={index * 200}>
              <div className="relative text-center group cursor-default">
                {/* Step number */}
                <div className="text-8xl font-bold text-white/[0.03] absolute -top-12 left-1/2 -translate-x-1/2 select-none group-hover:text-white/[0.06] transition-colors duration-500">
                  {item.step}
                </div>

                {/* Icon Card */}
                <div className="relative z-10 w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.08] transition-all duration-500 shadow-xl backdrop-blur-sm">
                  <item.icon className={`w-10 h-10 ${item.color}`} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">{item.title}</h3>
                <p className="text-white/50 leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* NAV Chart Section */}
      <section className="relative max-w-7xl mx-auto px-4 pb-32">
        <RevealSection>
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">NAV Performance</h2>
                <p className="text-white/40">Real-time valuation of underlying assets</p>
              </div>
              <Link to="/portfolio">
                <Button variant="outline" className="rounded-full border-white/10 hover:bg-white hover:text-black hover:border-transparent transition-all">
                  View Full History
                </Button>
              </Link>
            </div>

            <div className="h-[400px]">
              <NavChart data={navHistory} />
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Asset Types Grid */}
      <section className="relative max-w-7xl mx-auto px-4 pb-32">
        <RevealSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Diversified Portfolio</h2>
            <p className="text-white/40">Risk-adjusted exposure across multiple renewable sectors</p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Leaf, label: 'Solar Photovoltaic', color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Utility-scale solar farms in high-irradiance regions.' },
            { icon: Wind, label: 'Onshore Wind', color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Wind turbines capturing consistent energy in wind corridors.' },
            { icon: Battery, label: 'Grid Storage', color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Lithium-ion BESS for arbitrage and grid stabilization.' },
          ].map((asset, index) => (
            <RevealSection key={asset.label} delay={index * 150}>
              <div
                className="glass-panel p-8 rounded-3xl h-full border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.03] group"
              >
                <div className={`w-14 h-14 rounded-2xl ${asset.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <asset.icon className={`w-7 h-7 ${asset.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{asset.label}</h3>
                <p className="text-white/50 leading-relaxed font-light">{asset.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Trust & Technology */}
      <section className="relative border-t border-white/5 py-24 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <RevealSection>
            <p className="text-white/30 text-sm font-bold tracking-[0.2em] uppercase mb-12">Built on Institutional Infrastructure</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {['Solana', 'Anchor', 'Pyth', 'Switchboard', 'Clockwork'].map((tech) => (
                <span key={tech} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
