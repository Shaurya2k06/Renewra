import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FundStatsGrid } from '../components/StatCard';
import NavChart from '../components/NavChart';
import { useStore } from '../lib/store';
import { formatUSD } from '../lib/solana';

export default function HomePage() {
  const { fundStats, navHistory } = useStore();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Invest in
            <span className="text-green-400"> Renewable Energy</span>
            <br />on Solana
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Renewra tokenizes real-world solar, wind, and battery storage assets. 
            Get exposure to institutional-grade infrastructure with transparent 
            NAV and automated yield distribution.
          </p>
          
          {/* Current NAV Highlight */}
          <div className="inline-flex items-center gap-4 bg-gray-800/80 border border-gray-700 rounded-2xl px-8 py-4 mb-8">
            <div className="text-left">
              <p className="text-gray-400 text-sm">Current NAV</p>
              <p className="text-3xl font-bold text-green-400">
                {formatUSD(fundStats?.currentNav || 5000)}
              </p>
            </div>
            <div className="h-12 w-px bg-gray-700" />
            <div className="text-left">
              <p className="text-gray-400 text-sm">YTD Yield</p>
              <p className="text-3xl font-bold text-white">
                {fundStats?.ytdYield || 7.2}%
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subscribe">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                Subscribe Now
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-6">Fund Overview</h2>
        <FundStatsGrid stats={fundStats} />
      </section>

      {/* NAV Chart Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">NAV Performance</h2>
          <NavChart data={navHistory} />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">1️⃣</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Subscribe with USDC</h3>
            <p className="text-gray-400 text-sm">
              Deposit USDC and receive REI tokens at the current NAV price. 
              Minimal 0.5% mint fee.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">2️⃣</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Earn Yield</h3>
            <p className="text-gray-400 text-sm">
              Your tokens represent ownership in renewable energy projects. 
              Yield is distributed pro-rata automatically.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">3️⃣</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Redeem Anytime</h3>
            <p className="text-gray-400 text-sm">
              Request redemption to convert REI tokens back to USDC 
              at the current NAV price.
            </p>
          </div>
        </div>
      </section>

      {/* Powered By */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Powered by</p>
          <div className="flex items-center justify-center gap-8">
            <span className="text-2xl font-bold text-gray-400">Solana</span>
            <span className="text-2xl font-bold text-gray-400">Anchor</span>
            <span className="text-2xl font-bold text-gray-400">SPL Token</span>
          </div>
        </div>
      </section>
    </div>
  );
}
