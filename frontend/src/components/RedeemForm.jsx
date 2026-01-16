import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/button';
import { CheckCircle, ArrowRight, Lock, RefreshCw, Clock, Info, AlertTriangle } from 'lucide-react';
import { useReiToken } from '../lib/useReiToken';
import { formatUSD, formatDate, shortenPubkey } from '../lib/solana';
import { toDisplayAmount } from '../lib/types';

export default function RedeemForm() {
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
            case 0: return 'bg-white/10 text-white/60 border-white/10';
            default: return 'bg-white/10 text-white/60 border-white/10';
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

    return (
        <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
                {/* Form Section */}
                <div>
                    {/* Success Message */}
                    {txSignature && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 animate-reveal">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium mb-1">Redemption request submitted!</p>
                                    <a
                                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/60 text-sm hover:text-white inline-flex items-center gap-1 transition-colors"
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
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 animate-reveal">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
                                <p className="text-white/80">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* REI Balance */}
                        {connected ? (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="flex items-center gap-2 text-white/50">
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="text-sm">Available Balance</span>
                                </div>
                                <span className="text-white font-medium">
                                    {userReiBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} REI
                                </span>
                            </div>
                        ) : (
                            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-white/60 mb-4">Connect wallet to view balance</p>
                                <Button
                                    type="button"
                                    onClick={() => setVisible(true)}
                                    variant="outline"
                                    className="glass-button"
                                >
                                    Connect Wallet
                                </Button>
                            </div>
                        )}

                        {/* Token Input */}
                        <div className={!connected ? 'opacity-50 pointer-events-none' : ''}>
                            <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
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
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-5 text-white text-3xl font-light placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-display"
                                    disabled={hookSubmitting || !connected}
                                />
                                <button
                                    type="button"
                                    onClick={() => setTokenAmount(String(userReiBalance))}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                                    disabled={hookSubmitting || !connected}
                                >
                                    MAX
                                </button>
                            </div>
                        </div>

                        {/* Calculation */}
                        {tokens > 0 && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4 animate-reveal">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Current NAV</span>
                                    <span className="text-white">${navDisplay.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Gross Value</span>
                                    <span className="text-white">{formatUSD(grossUsdcCents)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Redemption Fee ({(redeemFeeBps / 100).toFixed(2)}%)</span>
                                    <span className="text-white/60">-{formatUSD(feeAmount)}</span>
                                </div>
                                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                                    <span className="text-white/60 font-medium">Net USDC Received</span>
                                    <span className="text-2xl font-bold text-white">
                                        {formatUSD(netUsdcCents)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={hookSubmitting || tokens <= 0 || !connected}
                            className="glass-button w-full h-14 rounded-xl flex items-center justify-center gap-2 text-lg font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {hookSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </span>
                            ) : connected ? (
                                'Request Redemption'
                            ) : (
                                'Connect Wallet'
                            )}
                        </button>

                        <p className="text-xs text-white/30 text-center flex items-center justify-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Processing time: 24-48 hours
                        </p>
                    </form>
                </div>

                {/* Info Column */}
                <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-6">Redemption Process</h3>
                        <ol className="space-y-6">
                            {[
                                'Submit your redemption request with the amount of REI tokens.',
                                'Your request enters the redemption queue and is processed in order.',
                                'Upon processing, REI tokens are burned and USDC is sent to your wallet.',
                                `A ${(redeemFeeBps / 100).toFixed(2)}% redemption fee is deducted to cover transaction costs.`,
                            ].map((step, index) => (
                                <li key={index} className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-medium text-xs">
                                        {index + 1}
                                    </span>
                                    <span className="text-white/60 text-sm leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex gap-4">
                        <Info className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white font-medium text-sm mb-1">Price Note</p>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Redemption prices are calculated at the NAV at the time of processing, not at the time of request.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queue Section */}
            <div className="pt-12 border-t border-white/5">
                <h2 className="text-2xl font-bold text-white mb-8">Redemption Queue</h2>
                {redemptionQueue.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white/40" />
                        </div>
                        <p className="text-white/40">No pending redemption requests</p>
                    </div>
                ) : (
                    <div className="glass-panel rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                                        <th className="px-6 py-4 font-medium">Requester</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Time</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {redemptionQueue.map((request, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-white/60 font-mono text-sm">
                                                {shortenPubkey(request.requester, 4)}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                {toDisplayAmount(request.amount, 6).toLocaleString(undefined, { maximumFractionDigits: 4 })} REI
                                            </td>
                                            <td className="px-6 py-4 text-white/40 text-sm">
                                                {formatDate(request.timestamp * 1000)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(request.status)}`}>
                                                    {getStatusText(request.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
