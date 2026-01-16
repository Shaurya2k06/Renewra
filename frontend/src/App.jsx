import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import InvestPage from './pages/InvestPage';
import PortfolioPage from './pages/PortfolioPage';

// Solana RPC endpoint
const RPC_ENDPOINT = import.meta.env.VITE_DEVNET_RPC || 'https://api.devnet.solana.com';

function App() {
  // Let wallet-adapter auto-detect wallets (Phantom, Solflare, etc.)
  // No need to manually specify adapters - they register as Standard Wallets
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-black text-white flex flex-col">
              <SmoothScroll>
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/invest" element={<InvestPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                  </Routes>
                </main>
                <Footer />
              </SmoothScroll>
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
