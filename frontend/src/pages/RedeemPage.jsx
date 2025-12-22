import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '../components/ui/button';
import AnimatedBackground from '../components/AnimatedBackground';
import { AlertTriangle, CheckCircle, Lock, ArrowRight, Info, Clock, RefreshCw } from 'lucide-react';
import { useReiToken } from '../lib/useReiToken';
import { formatUSD, formatDate, shortenPubkey } from '../lib/solana';
import { toDisplayAmount } from '../lib/types';

export default function RedeemPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { data, requestRedeem, isSubmitting: hookSubmitting, error: hookError, refresh } = useReiToken();

  const [tokenAmount, setTokenAmount] = useState('');
  const [txSignature, setTxSignature] = useState(null);
  const [localError, setLocalError] = useState(null);

  const currentNav = data?.currentNav || 0;
  const navDisplay = toDisplayAmount(currentNav, 2);
  const userReiBalance = toDisplayAmount(data?.userReiBalance || 0, 6);
  const redeemFeeBps = data?.redeemFeeBps || 100;

  // Calculate USDC received
  const tokens = parseFloat(tokenAmount || 0);
  const grossUsdcCents = tokens * navDisplay * 100;
  const feeAmount = (grossUsdcCents * redeemFeeBps) / 10000;
  const netUsdcCents = grossUsdcCents - feeAmount;

  // Redemption queue from on-chain data
  const redemptionQueue = data?.redemptionQueue || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setTxSignature(null);

    if (!connected) {
      setVisible(true);
      return;
    }

    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setLocalError('Please enter a valid amount');
      return;
    }

    if (tokens > userReiBalance) {
      setLocalError('Insufficient REI balance');
      return;
    }

    try {
      const signature = await requestRedeem(tokens);
      setTxSignature(signature);
      setTokenAmount('');
      refresh();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 2: return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 1: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 0: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 2: return 'Completed';
      case 1: return 'Processing';
      case 0: return 'Pending';
      default: return 'Unknown';
    }
  };

  const error = localError || hookError;

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
            Connect your Solana wallet to request redemptions.
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
    <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
      <AnimatedBackground variant="subtle" />

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
            <RefreshCw className="w-4 h-4" />
            <span>Convert REI to USDC</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Redeem REI Tokens
          </h1>
          <p className="text-gray-400 text-lg">
            Convert your REI tokens back to USDC at the current NAV price.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Redemption Form */}
          <div className="card-premium p-6 animate-fade-in-up" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            <h2 className="text-xl font-semibold text-white mb-6">Request Redemption</h2>

            {/* Success Message */}
            {txSignature && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-medium mb-2">Redemption request submitted!</p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-sm hover:underline inline-flex items-center gap-1"
                  >
                    View transaction
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 animate-fade-in">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Balance Info */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Your REI Balance</span>
                <span className="text-white font-semibold text-lg">
                  {userReiBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} REI
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  REI Amount to Redeem
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max={userReiBalance}
                    step="0.000001"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    disabled={hookSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setTokenAmount(String(userReiBalance))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
                    disabled={hookSubmitting}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Calculation */}
              {tokens > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 animate-fade-in">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current NAV</span>
                    <span className="text-white">${navDisplay.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gross Value</span>
                    <span className="text-white">{formatUSD(grossUsdcCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Redemption Fee ({(redeemFeeBps / 100).toFixed(2)}%)</span>
                    <span className="text-yellow-400">-{formatUSD(feeAmount)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Net USDC Received</span>
                    <span className="text-2xl font-bold gradient-text">
                      {formatUSD(netUsdcCents)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={hookSubmitting || tokens <= 0}
                variant="gradient"
                className="w-full"
                size="lg"
              >
                {hookSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : 'Submit Redemption Request'}
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Redemptions are processed within 24-48 hours.
            </p>
          </div>

          {/* Redemption Info */}
          <div className="space-y-6 animate-fade-in-up delay-100" style={{ animationFillMode: 'forwards', opacity: 0 }}>
            <div className="card-premium p-6">
              <h3 className="text-lg font-semibold text-white mb-5">How Redemptions Work</h3>
              <ol className="space-y-4">
                {[
                  'Submit your redemption request with the amount of REI tokens.',
                  'Your request enters the redemption queue and is processed in order.',
                  'Upon processing, REI tokens are burned and USDC is sent to your wallet.',
                  `A ${(redeemFeeBps / 100).toFixed(2)}% redemption fee is deducted to cover transaction costs.`,
                ].map((step, index) => (
                  <li key={index} className="flex gap-4 text-gray-400 text-sm">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center font-semibold text-xs">
                      {index + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium mb-1">Important Note</p>
                  <p className="text-yellow-400/80 text-sm">
                    Redemption prices are calculated at the NAV at time of processing, not at time of request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="mt-12 animate-fade-in-up delay-200" style={{ animationFillMode: 'forwards', opacity: 0 }}>
          <h2 className="text-xl font-semibold text-white mb-6">Redemption Queue</h2>
          <div className="card-premium overflow-hidden">
            {redemptionQueue.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500">No pending redemption requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="px-6 py-4 font-medium">Requester</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Requested</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptionQueue.map((request, idx) => (
                      <tr key={idx} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                          {shortenPubkey(request.requester, 4)}
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {toDisplayAmount(request.amount, 6).toLocaleString(undefined, { maximumFractionDigits: 4 })} REI
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(request.timestamp * 1000)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
