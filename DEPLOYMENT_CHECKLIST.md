# ChainMart Deployment Checklist

## Pre-Deployment Tasks

### Frontend Setup
- [ ] Update `frontend/.env.local` with:
  - NEXT_PUBLIC_API_URL
  - NEXT_PUBLIC_RPC_URL
  - NEXT_PUBLIC_MARKETPLACE_CONTRACT
  - NEXT_PUBLIC_REPUTATION_NFT_CONTRACT
- [ ] Run `npm install` in frontend/
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build` (check for errors)
- [ ] All 15+ pages accessible
- [ ] Web3 wallet connection working
- [ ] TypeScript compilation clean (no errors)

### Backend Setup
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Create `.env` file in backend/ with:
  - DATABASE_URL
  - REDIS_URL
  - SECRET_KEY
  - DEBUG=False (for production)
  - BLOCKCHAIN_RPC_URL
  - MARKETPLACE_CONTRACT_ADDRESS
  - PLATFORM_WALLET_ADDRESS
- [ ] Create Python virtual environment
- [ ] Install requirements: `pip install -r requirements.txt`
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Test locally: `python manage.py runserver`
- [ ] All API endpoints working
- [ ] WebSocket connections working
- [ ] Admin panel accessible

### Smart Contracts
- [ ] Hardhat installed: `npm install` in smart-contracts/
- [ ] Create `.env` with:
  - POLYGON_AMOY_RPC_URL
  - PRIVATE_KEY (testnet account)
- [ ] Compile contracts: `npx hardhat compile`
- [ ] Run tests: `npx hardhat test`
- [ ] Deploy to Amoy: `npx hardhat run scripts/deploy.js --network amoy`
- [ ] Save deployed contract addresses
- [ ] Verify contracts on Polygonscan
- [ ] Add contract addresses to `.env` files (frontend & backend)
- [ ] Test contract functions on Etherscan

## Frontend Testing

- [ ] Homepage loads
- [ ] Navigation menu works
- [ ] Registration page functional
- [ ] Login page functional
- [ ] Wallet connection works
- [ ] Browse products page shows products
- [ ] Product detail page loads
- [ ] Shopping cart works
- [ ] Checkout initiates blockchain transaction
- [ ] Dashboard accessible (buyer + seller views)
- [ ] Seller can create products
- [ ] Real-time updates via WebSocket

## Backend Testing

- [ ] User registration: `POST /users/`
- [ ] User login returns JWT
- [ ] Get current user: `GET /users/me/`
- [ ] List products: `GET /products/`
- [ ] Create product: `POST /products/`
- [ ] Get product detail: `GET /products/<id>/`
- [ ] List orders: `GET /orders/`
- [ ] Create order: `POST /orders/`
- [ ] Complete order: `POST /orders/<id>/complete_order/`
- [ ] Seller store: `GET /sellers/my_store/`
- [ ] Blockchain transaction: `POST /blockchain/record_transaction/`
- [ ] WebSocket connections established
- [ ] Admin panel working (http://localhost:8000/admin/)

## Smart Contract Testing

- [ ] Deploy contracts successfully
- [ ] Contract addresses correct
- [ ] createListing() works
- [ ] purchaseProduct() works
- [ ] completeOrder() distributes funds
- [ ] Dispute raising works
- [ ] Dispute resolution works
- [ ] Seller can withdraw
- [ ] Transaction history recorded

## End-to-End Testing

- [ ] User registration via email
- [ ] Wallet connection and verification
- [ ] Seller onboarding
- [ ] Product listing creation
- [ ] Browse marketplace
- [ ] Add to cart
- [ ] Complete checkout (blockchain)
- [ ] Order appears in buyer dashboard
- [ ] Order appears in seller dashboard
- [ ] Real-time status update
- [ ] Buyer completes order
- [ ] Funds released to seller
- [ ] Seller withdraws funds
- [ ] Seller reputation updated

## Security Checklist

- [ ] Django DEBUG=False for production
- [ ] SECRET_KEY is random and secure
- [ ] DATABASE_URL uses strong password
- [ ] JWT tokens configured correctly
- [ ] CORS_ALLOWED_ORIGINS restricted
- [ ] SSL/TLS enabled (production)
- [ ] Environment variables never in code
- [ ] API rate limiting active
- [ ] Database backups scheduled
- [ ] Error logging configured

## Documentation Review

- [ ] README.md complete and accurate
- [ ] API_INTEGRATION_GUIDE.md reviewed
- [ ] SETUP.md tested
- [ ] DEPLOYMENT.md comprehensive
- [ ] Code comments clear
- [ ] Type definitions documented

## Production Deployment

### Frontend (Vercel)
- [ ] Connect GitHub repository
- [ ] Set environment variables in Vercel
- [ ] Deploy: `npm run build` succeeds
- [ ] Verify production URL works
- [ ] Sitemap generated
- [ ] Analytics configured

### Backend (Railway/Heroku/Similar)
- [ ] Database provisioned
- [ ] Redis provisioned
- [ ] Environment variables set
- [ ] Migrations run on production
- [ ] Django collectstatic done
- [ ] Gunicorn/uWSGI configured
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Health check endpoint working

### Smart Contracts (Polygon)
- [ ] Deploy to Polygon Amoy testnet ✓
- [ ] Deploy to Polygon mainnet (when ready)
- [ ] Contract verified on Polygonscan
- [ ] Contract addresses updated in production
- [ ] Emergency pause mechanism tested
- [ ] Fund withdrawal tested on mainnet

## Post-Deployment

- [ ] Monitor application logs
- [ ] Monitor database performance
- [ ] Monitor smart contract interactions
- [ ] Test purchase flow with real MATIC
- [ ] Monitor system uptime
- [ ] Handle first customer support tickets
- [ ] Gather analytics
- [ ] Plan roadmap improvements

## Rollback Plan

- [ ] Keep previous contract addresses
- [ ] Keep database backups
- [ ] Keep frontend deployment history
- [ ] Documented rollback procedures
- [ ] Test rollback procedure before production

## Success Criteria

✅ All tests passing
✅ All pages loading
✅ All API endpoints working
✅ Smart contracts deployed
✅ Blockchain transactions processing
✅ Real-time features working
✅ Users can complete full purchase flow
✅ No console errors
✅ No API errors
✅ Database responsive
✅ WebSocket connections stable

---

**Once all checkboxes are complete, ChainMart is ready for production!**
