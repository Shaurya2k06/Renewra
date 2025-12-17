import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/button';
import { shortenPubkey } from '../lib/solana';

export default function ConnectWallet() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 hidden sm:block">
          {shortenPubkey(publicKey.toBase58())}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setVisible(true)}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      Connect Wallet
    </Button>
  );
}
