# Renewra - Renewable Energy Tokenized Fund

> A decentralized renewable energy index fund on Solana enabling fractional investment in renewable energy projects through tokenization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Framework-Anchor-blueviolet)](https://www.anchor-lang.com/)

## 🌟 Features

- **💰 Subscribe & Redeem**: Invest USDC to receive REI tokens representing fund shares
- **📊 Real-time NAV**: Oracle-based Net Asset Value updates
- **💎 Low Fees**: 2% mint, 0.5% redemption, 1% management
- **🔍 Transparent**: All transactions on-chain and verifiable
- **🎨 User-friendly**: Modern React frontend with Phantom/Solflare wallet integration

## 🚀 Quick Start

### For Users
1. Visit [app.renewra.io](https://app.renewra.io) (TODO)
2. Connect your Phantom or Solflare wallet
3. Subscribe with USDC to receive REI tokens
4. Track your investment on the dashboard

### For Developers

```bash
# Clone repository
git clone https://github.com/yourusername/Renewra.git
cd Renewra

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Visit http://localhost:5173

## 📁 Project Structure

```
Renewra/
├── contracts/          # Anchor smart contracts
│   ├── programs/       # Solana program (Rust)
│   ├── scripts/        # Deployment scripts
│   └── tests/          # Contract tests
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── lib/        # Blockchain integration
│   │   ├── pages/      # Page components
│   │   └── config/     # Configuration
│   └── public/         # Static assets
├── oracle/             # NAV oracle service (Python)
└── scripts/            # Utility scripts
```

## 🛠️ Tech Stack

- **Smart Contracts**: Anchor (Rust) on Solana
- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui
- **Wallet Integration**: Solana Wallet Adapter
- **State Management**: Zustand
- **Charts**: Recharts
- **Oracle**: Python 3.x

## 📊 How It Works

1. **Subscribe**: Users deposit USDC into the fund
2. **Mint**: Smart contract mints REI tokens based on current NAV
3. **Track**: NAV updates periodically from renewable energy metrics
4. **Redeem**: Users can queue redemption requests for their REI tokens

## 🔐 Security

- ✅ Anchor framework security features
- ✅ Input validation on all transactions
- ✅ Rate limiting on RPC requests
- ✅ Comprehensive error handling
- 🔄 Security audit pending

See [SECURITY.md](./SECURITY.md) for complete security documentation.

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Complete production deployment instructions
- **[Security Checklist](./SECURITY.md)** - Security measures and recommendations
- **API Documentation** - Coming soon

## 🧪 Testing

```bash
# Test smart contracts
cd contracts
anchor test

# Test frontend
cd frontend
npm test

# Integration tests
cd scripts
node test-utils.js checklist
```

## 🌐 Deployment

### Devnet (Current)
- **Program ID**: `5nU2nHv2Pw9bWWL2BsTotX6mDaP1fTj1EZ7JMXAe6T5Z`
- **Network**: Devnet
- **USDC**: Circle Devnet USDC

### Mainnet
See [DEPLOYMENT.md](./DEPLOYMENT.md) for mainnet deployment guide.

## 💡 Use Cases

- 🌞 Solar energy project investments
- 💨 Wind farm fractional ownership
- 🌊 Hydroelectric project exposure
- 🌱 Green energy portfolio diversification

## 📈 Roadmap

### ✅ Phase 1 - MVP (Complete)
- Smart contracts (Rust/Anchor)
- React frontend
- Python oracle service
- Devnet deployment

### 🔄 Phase 2 - Production
- Security audit
- Mainnet deployment
- Legal compliance
- Public launch

### 🔜 Phase 3 - Growth
- Mobile application
- Advanced analytics
- DAO governance
- Multi-asset support

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- **Email**: support@renewra.io
- **Discord**: [Join our community](https://discord.gg/renewra) (TODO)
- **Issues**: [GitHub Issues](https://github.com/yourusername/Renewra/issues)

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. Cryptocurrency investments carry inherent risks. The smart contracts have not yet been audited. Do your own research before investing. This is not financial advice.

## 🙏 Acknowledgments

- Solana Foundation for blockchain infrastructure
- Anchor framework team
- Open source community

---

**Built with ❤️ on Solana** | [Website](https://renewra.io) | [App](https://app.renewra.io) | [Docs](https://docs.renewra.io)