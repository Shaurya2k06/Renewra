export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Renewra" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">Renewra</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Tokenized renewable energy infrastructure on Solana. 
              Invest in solar, wind, and battery storage projects 
              with transparent NAV and yield distribution.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Protocol</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/projects" className="hover:text-white transition-colors">Projects</a></li>
              <li><a href="/nav-history" className="hover:text-white transition-colors">NAV History</a></li>
              <li><a href="/subscribe" className="hover:text-white transition-colors">Subscribe</a></li>
              <li><a href="/redeem" className="hover:text-white transition-colors">Redeem</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a 
                  href="https://explorer.solana.com/address/5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z?cluster=devnet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Program Explorer ↗
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub ↗
                </a>
              </li>
              <li><span className="cursor-not-allowed opacity-50">Documentation</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 Renewra. Built on Solana.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Network: Devnet</span>
            <span className="text-green-500">●</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
