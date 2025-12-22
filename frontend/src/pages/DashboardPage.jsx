import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { StatCard, BarChart3, WalletIcon, Clock, Coins } from '../components/StatCard';
import AnimatedBackground from '../components/AnimatedBackground';
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
import { useState } from 'react';

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
      <div className="relative min-h-[80vh] flex items-center justify-center px-4">
        <AnimatedBackground variant="subtle" />
        <div className="relative text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Lock className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Connect your Solana wallet to view your REI holdings, transaction history, and portfolio performance.
          </p>
          <Button
            onClick={() => setVisible(true)}
            variant="gradient"
            size="lg"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
      <AnimatedBackground variant="subtle" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="font-mono text-sm">{shortenPubkey(publicKey?.toBase58(), 6)}</span>
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              )}
            </button>
          </div>
          <div className="flex gap-3">
            <a
              href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
                Explorer
              </Button>
            </a>
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data?.currentNav && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin" />
            <p className="text-gray-400">Loading on-chain data...</p>
          </div>
        )}

        {/* Holdings Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              trend: 'up',
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
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Portfolio Summary */}
        <div className="card-premium p-6 md:p-8 mb-8 animate-fade-in-up delay-400" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <h2 className="text-xl font-semibold text-white mb-6">Portfolio Summary</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { label: 'REI Token Balance', value: `${reiBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} REI` },
                { label: 'Current Value (at NAV)', value: `$${currentValue.toFixed(2)}` },
                { label: 'Treasury Balance', value: `${toDisplayAmount(data?.treasuryBalance || 0, 6).toFixed(2)} USDC` },
                { label: 'Total REI Supply', value: `${tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} REI` },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="flex justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/10">
                <p className="text-gray-400 text-sm mb-2">Your Share of Fund</p>
                <p className="text-5xl font-bold gradient-text mb-2">{sharePercent}%</p>
                <p className="text-gray-500 text-sm">
                  Based on current token holdings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Info */}
        <div className="card-premium p-6 md:p-8 animate-fade-in-up delay-500" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <h2 className="text-xl font-semibold text-white mb-6">Fund Information</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Mint Fee', value: `${(data?.mintFeeBps || 50) / 100}%`, icon: ArrowUpRight, color: 'green' },
              { label: 'Redeem Fee', value: `${(data?.redeemFeeBps || 50) / 100}%`, icon: ArrowDownRight, color: 'yellow' },
              { label: 'Mgmt Fee', value: `${(data?.mgmtFeeBps || 200) / 100}%`, icon: Percent, color: 'blue' },
            ].map((fee) => (
              <div
                key={fee.label}
                className="text-center p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div className={`w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center ${fee.color === 'green' ? 'bg-green-500/10' :
                    fee.color === 'yellow' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }`}>
                  <fee.icon className={`w-5 h-5 ${fee.color === 'green' ? 'text-green-400' :
                      fee.color === 'yellow' ? 'text-yellow-400' : 'text-blue-400'
                    }`} />
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{fee.label}</p>
                <p className="text-xl font-bold text-white">{fee.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/subscribe" className="flex-1">
              <Button variant="gradient" className="w-full">
                <TrendingUp className="w-4 h-4" />
                Subscribe to Fund
              </Button>
            </Link>
            <Link to="/redeem" className="flex-1">
              <Button variant="outline" className="w-full">
                Request Redemption
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
