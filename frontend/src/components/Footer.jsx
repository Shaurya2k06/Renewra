import { Link } from 'react-router-dom';
import { Github, Twitter, ExternalLink, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  protocol: [
    { label: 'Invest', href: '/invest' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  resources: [
    { label: 'Explorer', href: 'https://explorer.solana.com/address/5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z?cluster=devnet', external: true },
    { label: 'Documentation', href: '#', disabled: true },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 group mb-8">
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
                <div className="w-5 h-5 bg-black rounded-sm" />
              </div>
              <span className="text-2xl font-bold text-white font-display tracking-tight">Renewra</span>
            </Link>
            <p className="text-white/40 text-lg leading-relaxed max-w-sm mb-8">
              Tokenized renewable energy infrastructure on Solana.
              Transparent, liquid, and sustainable yield.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-white font-bold mb-6">Protocol</h4>
            <ul className="space-y-4">
              {footerLinks.protocol.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/40 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4">
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  {link.disabled ? (
                    <span className="text-white/20 text-sm cursor-not-allowed flex items-center gap-2">
                      {link.label}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 uppercase tracking-wide">Soon</span>
                    </span>
                  ) : link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-white/40 hover:text-white transition-colors text-sm"
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
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} Renewra. All rights reserved.
          </p>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/40 text-xs font-medium">Solana Devnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
