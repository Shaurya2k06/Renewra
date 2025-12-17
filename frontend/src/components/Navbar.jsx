import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import ConnectWallet from './ConnectWallet';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/subscribe', label: 'Subscribe' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/redeem', label: 'Redeem' },
  { path: '/nav-history', label: 'NAV History' },
];

export default function Navbar() {
  const location = useLocation();
  const { connected } = useWallet();

  return (
    <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-white">Renewra</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {connected && (
              <span className="hidden sm:block text-xs text-green-400">
                ● Connected
              </span>
            )}
            <ConnectWallet />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-800 px-2 py-2">
        <div className="flex flex-wrap gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
