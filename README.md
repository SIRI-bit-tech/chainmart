# ChainMart - Web3 Marketplace

Production-ready decentralized marketplace with smart contract escrow, real blockchain integration, and multi-vendor support.

## Features

### Marketplace Core
- ✅ Multi-vendor product listings
- ✅ Advanced search and filtering
- ✅ Smart contract escrow for secure payments
- ✅ Automatic dispute resolution
- ✅ Real-time order tracking

### Web3 Integration
- ✅ MetaMask wallet connection
- ✅ Polygon mainnet/testnet support
- ✅ Smart contract interactions
- ✅ Transaction verification
- ✅ NFT-based reputation system

### User Features
- ✅ Hybrid authentication (wallet + email)
- ✅ Seller dashboard with analytics
- ✅ Buyer order history
- ✅ Review and rating system
- ✅ Real-time notifications

### Backend
- ✅ Django REST API
- ✅ PostgreSQL database
- ✅ Redis caching
- ✅ Celery async tasks
- ✅ WebSocket real-time features

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Web3.js / Ethers.js
- React Hooks

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- Redis
- Celery

### Blockchain
- Solidity smart contracts
- Hardhat development framework
- Polygon network (mainnet + Amoy testnet)
- OpenZeppelin contracts

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- MetaMask wallet

### Installation

1. **Clone repository**
\`\`\`bash
git clone https://github.com/yourusername/chainmart.git
cd chainmart
\`\`\`

2. **Setup Backend**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
\`\`\`

3. **Setup Frontend**
\`\`\`bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
\`\`\`

4. **Deploy Smart Contracts**
\`\`\`bash
cd smart-contracts
npm install
npx hardhat run scripts/deploy.js --network amoy
\`\`\`

## Environment Variables

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_REPUTATION_NFT_CONTRACT=0x...
\`\`\`

### Backend (.env)
\`\`\`
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=chainmart
DB_USER=postgres
DB_PASSWORD=postgres
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology/
MARKETPLACE_CONTRACT_ADDRESS=0x...
\`\`\`

## Smart Contracts

### MarketplaceEscrow
- Product listing creation
- Purchase with escrow
- Payment distribution
- Dispute resolution
- Seller fund withdrawal

### ReputationNFT
- Seller reputation tracking
- NFT badge minting
- Reputation level management

## API Documentation

API documentation available at `http://localhost:8000/api/docs/`

### Key Endpoints

**Products**
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create listing
- `GET /api/v1/products/{id}` - Get product details

**Orders**
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{id}` - Get order details

**Users**
- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/users/profile` - Update profile

## Deployment

### Production Checklist

- [ ] Deploy smart contracts to Polygon mainnet
- [ ] Update contract addresses in environment variables
- [ ] Configure production database
- [ ] Setup SSL certificates
- [ ] Configure email service
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy
- [ ] Security audit of smart contracts

### Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

## Security

- Smart contracts audited for reentrancy and overflow attacks
- JWT authentication with refresh tokens
- Row-level security on database
- CORS protection
- Rate limiting on API endpoints
- Wallet signature verification

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact support@chainmart.io
