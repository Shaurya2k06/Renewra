import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/button';
import { useReiToken } from '../lib/useReiToken';
import { formatUSD, formatTokenAmount } from '../lib/solana';
import { toDisplayAmount } from '../lib/types';

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
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <p className="text-green-400 font-medium mb-2">✓ Subscription successful!</p>
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
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {/* USDC Balance */}
      {connected && (
        <div className="text-sm text-gray-400">
          Available: <span className="text-white">{userUsdcBalance.toFixed(2)} USDC</span>
        </div>
      )}
      
      {/* USDC Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
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
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            USDC
          </span>
        </div>
      </div>

      {/* Calculation Breakdown */}
      {usdcAmount && parseFloat(usdcAmount) > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
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
          
          <div className="border-t border-gray-700 pt-3 flex justify-between">
            <span className="text-gray-300 font-medium">REI Tokens Received</span>
            <span className="text-green-400 font-bold text-lg">
              {tokensReceived.toFixed(4)} REI
            </span>
          </div>
        </div>
      )}

      {/* Quick Amount Buttons */}
      <div className="flex gap-2">
        {[100, 500, 1000, 5000].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setUsdcAmount(Math.min(amount, userUsdcBalance || amount).toString())}
            className="flex-1 py-2 px-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : connected ? (
          'Subscribe to Renewra'
        ) : (
          'Connect Wallet to Subscribe'
        )}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        By subscribing, you acknowledge that this is on Solana devnet for testing purposes only.
      </p>
    </form>
  );
}
