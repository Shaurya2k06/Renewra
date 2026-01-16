import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Menu, X } from 'lucide-react';
import CustomConnectWallet from './ConnectWallet'; // Renamed to avoid import conflict if any

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/invest', label: 'Invest' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/portfolio', label: 'Portfolio' },
];

export default function Navbar() {
  const location = useLocation();
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`glass-nav rounded-2xl px-6 py-4 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-black/60 shadow-2xl backdrop-blur-xl' : 'bg-transparent border-transparent'
              }`}
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg">
                <div className="w-6 h-6 bg-black rounded-sm" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight font-display">
                Renewra
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              {connected && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-white/80">Connected</span>
                </div>
              )}

              {/* Wallet Button */}
              <div className="glass-button rounded-xl hover:scale-105 active:scale-95 transition-all">
                <CustomConnectWallet />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden fixed inset-x-6 top-24 transition-all duration-500 ease-in-out transform origin-top ${mobileMenuOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 bg-[#0A0A0A]">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === link.path
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-white/10 my-2" />

              <div className="px-4 py-2 flex items-center justify-between text-xs text-white/40">
                <span>Network</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-white/60">Solana Devnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
