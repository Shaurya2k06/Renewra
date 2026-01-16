import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { StatCard, BarChart3, WalletIcon, Clock, Coins } from '../components/StatCard';
import VideoBackground from '../components/VideoBackground';
import { useReiToken } from '../lib/useReiToken';
import { shortenPubkey } from '../lib/solana';
import { toDisplayAmount } from '../lib/types';
import {
  Lock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  TrendingUp,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { data, loading, refresh } = useReiToken();
  const [copied, setCopied] = useState(false);

  // Refresh on mount
  useEffect(() => {
    if (connected) {
      refresh();
    }
  }, [connected, refresh]);

  // Calculate values
  const currentNav = data?.currentNav || 0;
  const navDisplay = toDisplayAmount(currentNav, 2);
  const reiBalance = toDisplayAmount(data?.userReiBalance || 0, 6);
  const tokenSupply = toDisplayAmount(data?.tokenSupply || 0, 6);
  const currentValue = reiBalance * navDisplay;

  // Calculate share of fund
  const sharePercent = tokenSupply > 0 ? (reiBalance / tokenSupply * 100).toFixed(4) : '0.0000';

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <VideoBackground overlayOpacity={0.6} />

        <div className="relative z-10 glass-panel p-10 rounded-3xl text-center max-w-md w-full animate-reveal">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full glass-button flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Connect Wallet
          </h1>
          <p className="text-body-standard text-white/60 mb-8">
            Connect your Solana wallet to view your REI holdings, transaction history, and portfolio performance.
          </p>
          <button
            onClick={() => setVisible(true)}
            className="glass-button w-full h-12 rounded-xl text-lg font-medium hover:bg-white/10"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-24 md:py-32">
      <VideoBackground overlayOpacity={0.65} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-reveal">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group border border-white/5"
              >
                <span className="font-mono text-sm text-white/80">{shortenPubkey(publicKey?.toBase58(), 6)}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white/40 group-hover:text-white" />
                )}
              </button>

              <a
                href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors p-1.5"
                title="View on Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="glass-button px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Loading State */}
        {loading && !data?.currentNav && (
          <div className="text-center py-24 glass-panel rounded-3xl animate-reveal">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-white/60">Loading infrastructure data...</p>
          </div>
        )}

        {/* Holdings Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'REI Balance',
              value: `${reiBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} REI`,
              subValue: `≈ $${currentValue.toFixed(2)}`,
              icon: Coins,
            },
            {
              label: 'Current NAV',
              value: `$${navDisplay.toFixed(2)}`,
              subValue: 'Per REI token',
              icon: BarChart3,
            },
            {
              label: 'USDC Balance',
              value: `${toDisplayAmount(data?.userUsdcBalance || 0, 6).toFixed(2)} USDC`,
              subValue: 'Available to invest',
              icon: WalletIcon,
            },
            {
              label: 'Fund Share',
              value: `${sharePercent}%`,
              subValue: `of ${tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })} REI`,
              icon: Clock,
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-panel p-6 rounded-2xl animate-reveal hover:bg-white/5 transition-colors duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/40 text-sm">{stat.subValue}</p>
            </div>
          ))}
        </div>

        {/* Portfolio Summary */}
        <div className="glass-panel p-8 rounded-3xl mb-8 animate-reveal delay-300">
          <h2 className="text-2xl font-bold text-white mb-8">Portfolio Summary</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                { label: 'REI Token Balance', value: `${reiBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} REI` },
                { label: 'Current Value (at NAV)', value: `$${currentValue.toFixed(2)}` },
                { label: 'Treasury Balance', value: `${toDisplayAmount(data?.treasuryBalance || 0, 6).toFixed(2)} USDC` },
                { label: 'Total REI Supply', value: `${tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} REI` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
                  <span className="text-white/50">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center p-10 rounded-3xl bg-white/[0.02] border border-white/5 w-full">
                <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Your Share of Fund</p>
                <p className="text-6xl font-bold text-white mb-3 tracking-tight">{sharePercent}%</p>
                <p className="text-white/40 text-sm">
                  Based on current token holdings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Info */}
        <div className="glass-panel p-8 rounded-3xl animate-reveal delay-500">
          <h2 className="text-2xl font-bold text-white mb-8">Fund Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Mint Fee', value: `${(data?.mintFeeBps || 50) / 100}%`, icon: ArrowUpRight },
              { label: 'Redeem Fee', value: `${(data?.redeemFeeBps || 50) / 100}%`, icon: ArrowDownRight },
              { label: 'Mgmt Fee', value: `${(data?.mgmtFeeBps || 200) / 100}%`, icon: Percent },
            ].map((fee) => (
              <div
                key={fee.label}
                className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <fee.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{fee.label}</p>
                  <p className="text-2xl font-bold text-white">{fee.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/subscribe" className="flex-1">
              <button className="glass-button w-full h-14 rounded-xl flex items-center justify-center gap-2 text-lg font-medium hover:bg-white/10">
                <TrendingUp className="w-5 h-5" />
                Subscribe to Fund
              </button>
            </Link>
            <Link to="/redeem" className="flex-1">
              <button className="glass-button w-full h-14 rounded-xl flex items-center justify-center gap-2 text-lg font-medium hover:bg-white/10">
                Request Redemption
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
