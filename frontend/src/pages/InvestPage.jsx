import { useState } from 'react';
import VideoBackground from '../components/VideoBackground';
import SubscribeForm from '../components/SubscribeForm';
import RedeemForm from '../components/RedeemForm';
import { useStore } from '../lib/store';
import { formatUSD } from '../lib/solana';
import { TrendingUp, ArrowRightLeft } from 'lucide-react';

export default function InvestPage() {
    const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
    const { fundStats } = useStore();

    return (
        <div className="relative min-h-screen py-24 md:py-32">
            <VideoBackground overlayOpacity={0.8} />

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12 animate-reveal">
                    <h1 className="text-hero text-white mb-6">Invest in Renewra</h1>
                    <p className="text-body-large text-white/60 max-w-2xl mx-auto">
                        Manage your investment in renewable energy infrastructure.
                        Buy REI with USDC or redeem your holdings.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl mb-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 animate-reveal delay-100">
                    <div className="text-center">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Current NAV</p>
                        <p className="text-4xl font-bold text-white">{formatUSD(fundStats?.currentNav || 5000)}</p>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-white/10" />
                    <div className="text-center">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Total Supply</p>
                        <p className="text-3xl font-semibold text-white">
                            {((fundStats?.totalSupply || 0) / 1000000).toFixed(2)}M
                            <span className="text-white/40 ml-2 text-lg font-normal">REI</span>
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10 animate-reveal delay-200">
                    <div className="glass-panel p-1 rounded-2xl inline-flex">
                        <button
                            onClick={() => setActiveTab('buy')}
                            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'buy'
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Subscribe (Buy)
                        </button>
                        <button
                            onClick={() => setActiveTab('sell')}
                            className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'sell'
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Redeem (Sell)
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="glass-panel p-8 md:p-12 rounded-[2rem] animate-reveal delay-300 min-h-[500px]">
                    {activeTab === 'buy' ? (
                        <div className="max-w-xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-bold text-white mb-2">Subscribe to Fund</h2>
                                <p className="text-white/60">Mint new REI tokens by depositing USDC</p>
                            </div>
                            <SubscribeForm />
                        </div>
                    ) : (
                        <div>
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-bold text-white mb-2">Redeem Holdings</h2>
                                <p className="text-white/60">Burn REI tokens to receive USDC back</p>
                            </div>
                            <RedeemForm />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
