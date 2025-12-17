import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import SubscribePage from './pages/SubscribePage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import RedeemPage from './pages/RedeemPage';
import NavHistoryPage from './pages/NavHistoryPage';

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
            <div className="min-h-screen bg-gray-950 text-white flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/subscribe" element={<SubscribePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/redeem" element={<RedeemPage />} />
                  <Route path="/nav-history" element={<NavHistoryPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
