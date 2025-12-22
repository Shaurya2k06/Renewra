import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Menu, X, Zap } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="glass rounded-2xl px-4 sm:px-6 py-3 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Renewra"
                  className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Renewra
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {/* Active background */}
                  {location.pathname === link.path && (
                    <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-90" />
                  )}
                  {/* Hover background */}
                  <span className="absolute inset-0 bg-white/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              {connected && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-xs font-medium text-green-400">Connected</span>
                </div>
              )}

              {/* Wallet Button */}
              <ConnectWallet />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileMenuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}>
          <div className="glass rounded-2xl p-4 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: mobileMenuOpen ? 'fadeInUp 0.3s ease-out forwards' : 'none'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Network Status */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-green-500" />
                  <span>Solana Devnet</span>
                </div>
                {connected && (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    <span>Wallet Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to account for fixed navbar */}
      <div className="h-24" />
    </>
  );
}
