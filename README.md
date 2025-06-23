# AI Agent Marketplace & Testing Platform

A comprehensive decentralized platform for AI agent discovery, testing, and licensing built with Next.js, Supabase, and Ethereum smart contracts.

## 🌟 Features

### Core Platform
- **AI Agent Marketplace**: Browse and discover AI agents across multiple categories
- **Interactive Testing Sandbox**: Test agents with custom input and real-time benchmarking
- **Blockchain Licensing**: Smart contract-based licensing with ETH payments
- **IPFS Storage**: Decentralized model storage using Web3.Storage
- **Developer Portal**: Upload and monetize AI agents
- **User Dashboard**: Manage licenses, view test history, and track usage

### Technical Stack
- **Frontend**: Next.js 13, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python) for AI inference
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Ethereum (Sepolia testnet), Solidity smart contracts
- **Storage**: IPFS via Web3.Storage
- **Web3**: wagmi, RainbowKit for wallet integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-agent-marketplace
```

2. **Install dependencies**
```bash
npm install
cd backend && pip install -r requirements.txt
```

3. **Environment Setup**
```bash
cp .env.example .env.local
# Fill in your environment variables
```

4. **Database Setup**
- Create a Supabase project
- Run the migration: `supabase/migrations/create_agents_tables.sql`
- Update your `.env.local` with Supabase credentials

5. **Start Development Servers**

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
python main.py
```

## 🏗️ Architecture

### Smart Contract
The `AIAgentMarketplace.sol` contract handles:
- Agent registration and metadata
- License purchases and management
- Rating and review system
- Usage tracking
- Platform fee collection

### Database Schema
- **agents**: AI agent metadata and configuration
- **benchmarks**: Performance metrics and test results
- **user_licenses**: License ownership tracking
- **reviews**: User ratings and feedback

### API Endpoints
- `GET /agents` - List all available agents
- `POST /test` - Test an agent with custom input
- `POST /agents/{id}/benchmark` - Run comprehensive benchmarks
- `GET /health` - System health check

## 🧪 Testing

### Seed Data
The platform includes realistic seed data:
- 3 sample AI agents (Text Summarizer, Sentiment Analyzer, Image Caption Generator)
- Mock user licenses and reviews
- Performance benchmarks
- Test transaction history

### Test Agents
1. **Text Summarizer Pro** - BART-based summarization (0.01 ETH)
2. **Sentiment Analyzer** - Real-time sentiment analysis (Free)
3. **Image Caption Generator** - Computer vision captions (0.02 ETH)

## 🔧 Configuration

### Promo Codes Integration
The platform supports various service integrations:
- RevenueCat: `rev.cat/bolt`
- Sentry: `bolt-sentry-wlh`
- IPFS/API: `BOLTsmgbmtwwms512`
- Additional codes for Lingo, Dappier, Pica, Expo, DEV++

### Smart Contract Deployment
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## 📱 Features Overview

### For Users
- Browse AI agents by category and rating
- Test agents with custom input before licensing
- View real-time performance benchmarks
- Purchase licenses with ETH
- Rate and review agents
- Track usage and spending

### For Developers
- Upload AI models to IPFS
- Configure pricing and metadata
- Monitor usage and earnings
- View performance analytics
- Manage agent lifecycle

### For Platform
- Decentralized architecture
- Smart contract automation
- Revenue sharing (90% to creators)
- Comprehensive analytics
- Security and compliance

## 🛠️ Development

### Project Structure
```
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utility libraries
├── contracts/          # Solidity smart contracts
├── backend/            # FastAPI backend
├── supabase/           # Database migrations
└── public/             # Static assets
```

### Key Components
- `Header`: Navigation and wallet connection
- `AgentCard`: Agent display and interaction
- `TestSandbox`: Interactive testing interface
- `DeveloperPortal`: Agent upload and management
- `Dashboard`: User analytics and management

## 🔐 Security

- Row Level Security (RLS) on all database tables
- Smart contract access controls
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure wallet integration

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Docker/Cloud)
```bash
cd backend
docker build -t ai-agent-api .
docker run -p 8000:8000 ai-agent-api
```

### Smart Contracts
Deploy to Ethereum testnets or mainnet using Hardhat.

## 📊 Monitoring

- Supabase Analytics for database metrics
- Smart contract events for blockchain activity
- FastAPI metrics for backend performance
- User analytics for platform usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our Discord community

---

Built with ❤️ for the decentralized AI future.