import SubscribeForm from '../components/SubscribeForm';
import AnimatedBackground from '../components/AnimatedBackground';
import { useStore } from '../lib/store';
import { formatUSD } from '../lib/solana';
import { Shield, Zap, Clock, TrendingUp } from 'lucide-react';

export default function SubscribePage() {
  const { fundStats } = useStore();

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-8 md:py-12">
      <AnimatedBackground variant="subtle" />

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Earn sustainable yield</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Subscribe to Renewra
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Deposit USDC to receive REI tokens representing ownership in
            renewable energy infrastructure.
          </p>
        </div>

        {/* Current NAV Info */}
        <div className="card-premium p-6 mb-8 animate-fade-in-up delay-100" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current NAV</p>
              <p className="text-3xl font-bold gradient-text">
                {formatUSD(fundStats?.currentNav || 5000)}
              </p>
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">Total Supply</p>
              <p className="text-2xl font-semibold text-white">
                {((fundStats?.totalSupply || 0) / 1000000).toFixed(2)}M
                <span className="text-green-400 ml-1 text-lg">REI</span>
              </p>
            </div>
          </div>
        </div>

        {/* Subscribe Form */}
        <div className="card-premium p-6 md:p-8 mb-8 animate-fade-in-up delay-200" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <SubscribeForm />
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up delay-300" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          {[
            {
              icon: Shield,
              title: 'Secure',
              description: 'All transactions are executed on-chain via audited Anchor smart contracts.',
              color: 'green',
            },
            {
              icon: Zap,
              title: 'Instant',
              description: 'REI tokens are minted instantly to your wallet upon subscription confirmation.',
              color: 'yellow',
            },
            {
              icon: TrendingUp,
              title: 'Transparent',
              description: 'NAV is updated regularly with full visibility into underlying assets.',
              color: 'blue',
            },
            {
              icon: Clock,
              title: 'Flexible',
              description: 'Redeem your tokens anytime at current NAV with minimal fees.',
              color: 'purple',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="card-premium p-5 group hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300 ${feature.color === 'green' ? 'bg-green-500/10' :
                    feature.color === 'yellow' ? 'bg-yellow-500/10' :
                      feature.color === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                  }`}>
                  <feature.icon className={`w-5 h-5 ${feature.color === 'green' ? 'text-green-400' :
                      feature.color === 'yellow' ? 'text-yellow-400' :
                        feature.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                    }`} />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
