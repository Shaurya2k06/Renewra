import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '../components/ui/button';
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
  const redeemFeeBps = data?.redeemFeeBps || 100; // 1%
  
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
      case 2: return 'bg-green-900/50 text-green-400'; // completed
      case 1: return 'bg-yellow-900/50 text-yellow-400'; // processing
      case 0: return 'bg-gray-700 text-gray-300'; // pending
      default: return 'bg-gray-700 text-gray-300';
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Connect Your Wallet
        </h1>
        <p className="text-gray-400 mb-8">
          Connect your Solana wallet to request redemptions.
        </p>
        <Button 
          onClick={() => setVisible(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Redeem REI Tokens
        </h1>
        <p className="text-gray-400">
          Convert your REI tokens back to USDC at the current NAV price.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Redemption Form */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Request Redemption</h2>
          
          {/* Success Message */}
          {txSignature && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-400 font-medium mb-2">✓ Redemption request submitted!</p>
              <a 
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 text-sm hover:underline break-all"
              >
                View transaction ↗
              </a>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {/* Balance Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Your REI Balance</span>
              <span className="text-white font-medium">
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
                  placeholder="0"
                  min="0"
                  max={userReiBalance}
                  step="0.000001"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={hookSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setTokenAmount(String(userReiBalance))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm hover:underline"
                  disabled={hookSubmitting}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Calculation */}
            {tokens > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
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
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="text-gray-300 font-medium">Net USDC Received</span>
                  <span className="text-green-400 font-bold text-lg">
                    {formatUSD(netUsdcCents)}
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={hookSubmitting || tokens <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {hookSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Redemption Request'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Redemptions are processed within 24-48 hours.
          </p>
        </div>

        {/* Redemption Info */}
        <div className="space-y-6">
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How Redemptions Work</h3>
            <ol className="space-y-3 text-gray-400 text-sm">
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">1.</span>
                Submit your redemption request with the amount of REI tokens.
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">2.</span>
                Your request enters the redemption queue and is processed in order.
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">3.</span>
                Upon processing, REI tokens are burned and USDC is sent to your wallet.
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">4.</span>
                A {(redeemFeeBps / 100).toFixed(2)}% redemption fee is deducted to cover transaction costs.
              </li>
            </ol>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ <strong>Note:</strong> Redemption prices are calculated at the NAV at 
              time of processing, not at time of request.
            </p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Redemption Queue</h2>
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
          {redemptionQueue.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending redemption requests
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="px-6 py-3 font-medium">Requester</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Requested</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {redemptionQueue.map((request, idx) => (
                  <tr key={idx} className="border-t border-gray-800">
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                      {shortenPubkey(request.requester, 4)}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {toDisplayAmount(request.amount, 6).toLocaleString(undefined, { maximumFractionDigits: 4 })} REI
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(request.timestamp * 1000)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
