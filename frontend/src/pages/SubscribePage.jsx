import SubscribeForm from '../components/SubscribeForm';
import { useStore } from '../lib/store';
import { formatUSD } from '../lib/solana';

export default function SubscribePage() {
  const { fundStats } = useStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Subscribe to Renewra
        </h1>
        <p className="text-gray-400">
          Deposit USDC to receive REI tokens representing ownership in 
          renewable energy infrastructure.
        </p>
      </div>

      {/* Current NAV Info */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Current NAV</p>
            <p className="text-2xl font-bold text-green-400">
              {formatUSD(fundStats?.currentNav || 5000)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total Supply</p>
            <p className="text-xl text-white">
              {((fundStats?.totalSupply || 0) / 1000000).toFixed(2)}M REI
            </p>
          </div>
        </div>
      </div>

      {/* Subscribe Form */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
        <SubscribeForm />
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">🔒 Secure</h4>
          <p className="text-gray-400 text-sm">
            All transactions are executed on-chain via audited Anchor smart contracts.
          </p>
        </div>
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">⚡ Instant</h4>
          <p className="text-gray-400 text-sm">
            REI tokens are minted instantly to your wallet upon subscription confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
