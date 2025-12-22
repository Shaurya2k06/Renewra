import { Link } from 'react-router-dom';
import { Github, Twitter, ExternalLink, Zap, Leaf, Wind, Battery } from 'lucide-react';

const footerLinks = {
  protocol: [
    { label: 'Projects', href: '/projects' },
    { label: 'NAV History', href: '/nav-history' },
    { label: 'Subscribe', href: '/subscribe' },
    { label: 'Redeem', href: '/redeem' },
  ],
  resources: [
    {
      label: 'Program Explorer',
      href: 'https://explorer.solana.com/address/5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z?cluster=devnet',
      external: true
    },
    { label: 'GitHub', href: 'https://github.com', external: true },
    { label: 'Documentation', href: '#', disabled: true },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-gray-950 to-black mt-auto overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 opacity-5">
        <Leaf className="w-32 h-32 text-green-500" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-5">
        <Wind className="w-24 h-24 text-blue-500" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="relative">
                <img src="/logo.png" alt="Renewra" className="h-10 w-10" />
                <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Renewra</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Tokenized renewable energy infrastructure on Solana.
              Invest in solar, wind, and battery storage projects
              with transparent NAV and automated yield distribution.
            </p>

            {/* Energy icons */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Wind className="h-5 w-5" />
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Battery className="h-5 w-5" />
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Protocol
            </h4>
            <ul className="space-y-3">
              {footerLinks.protocol.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 text-sm hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.disabled ? (
                    <span className="text-gray-600 text-sm cursor-not-allowed inline-flex items-center gap-1">
                      {link.label}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">Soon</span>
                    </span>
                  ) : link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 text-sm hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-1.5 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-gray-400 text-sm hover:text-green-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Renewra. Built on Solana.
            </p>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-gray-400 text-sm">Network: Devnet</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
