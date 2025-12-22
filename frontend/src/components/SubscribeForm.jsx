import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/button';
import { useReiToken } from '../lib/useReiToken';
import { formatUSD } from '../lib/solana';
import { toDisplayAmount } from '../lib/types';
import { CheckCircle, AlertCircle, ArrowRight, Wallet, Coins } from 'lucide-react';

export default function SubscribeForm() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const {
    data,
    subscribe,
    isSubmitting,
    error: hookError
  } = useReiToken();

  const [usdcAmount, setUsdcAmount] = useState('');
  const [txSignature, setTxSignature] = useState(null);
  const [localError, setLocalError] = useState(null);

  const currentNav = data?.currentNav || 5000;
  const mintFeeBps = data?.mintFeeBps || 50;
  const userUsdcBalance = toDisplayAmount(data?.userUsdcBalance || 0, 6);

  // Calculate tokens received
  const usdcValue = parseFloat(usdcAmount || 0);
  const usdcCents = usdcValue * 100;
  const feeAmount = (usdcCents * mintFeeBps) / 10000;
  const netUsdcCents = usdcCents - feeAmount;
  const tokensReceived = currentNav > 0 ? (netUsdcCents / currentNav) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setTxSignature(null);

    if (!connected) {
      setVisible(true);
      return;
    }

    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      setLocalError('Please enter a valid amount');
      return;
    }

    if (usdcValue > userUsdcBalance) {
      setLocalError('Insufficient USDC balance');
      return;
    }

    try {
      const signature = await subscribe(usdcValue);
      setTxSignature(signature);
      setUsdcAmount('');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const error = localError || hookError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {txSignature && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-semibold mb-2">Subscription successful!</p>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 text-sm hover:text-green-200 inline-flex items-center gap-1 transition-colors"
              >
                View transaction
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* USDC Balance */}
      {connected && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 text-gray-400">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Available Balance</span>
          </div>
          <span className="text-white font-semibold">{userUsdcBalance.toFixed(2)} USDC</span>
        </div>
      )}

      {/* USDC Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          USDC Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            max={userUsdcBalance}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
            disabled={isSubmitting}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            USDC
          </span>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[100, 500, 1000, 5000].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setUsdcAmount(Math.min(amount, userUsdcBalance || amount).toString())}
            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${parseFloat(usdcAmount) === amount
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            disabled={isSubmitting}
          >
            ${amount.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Calculation Breakdown */}
      {usdcAmount && parseFloat(usdcAmount) > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current NAV</span>
            <span className="text-white">{formatUSD(currentNav)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mint Fee ({(mintFeeBps / 100).toFixed(2)}%)</span>
            <span className="text-yellow-400">-{formatUSD(feeAmount)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Net Investment</span>
            <span className="text-white">{formatUSD(netUsdcCents)}</span>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-300 font-medium">
              <Coins className="w-4 h-4 text-green-400" />
              <span>REI Tokens Received</span>
            </div>
            <span className="text-2xl font-bold gradient-text">
              {tokensReceived.toFixed(4)} REI
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || (!connected && false)}
        variant="gradient"
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : connected ? (
          <>
            Subscribe to Renewra
            <ArrowRight className="w-5 h-5" />
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            Connect Wallet to Subscribe
          </>
        )}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        By subscribing, you acknowledge that this is on Solana Devnet for testing purposes only.
        No real funds are involved.
      </p>
    </form>
  );
}
