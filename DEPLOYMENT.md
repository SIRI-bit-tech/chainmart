# ChainMart Deployment Guide

## Production Deployment Checklist

### 1. Smart Contract Deployment

#### Polygon Mainnet Deployment

\`\`\`bash
cd smart-contracts

# Set environment variables
export PRIVATE_KEY=your_wallet_private_key
export POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network polygon

# Verify contracts on PolygonScan
npx hardhat verify --network polygon CONTRACT_ADDRESS "constructor_args"
\`\`\`

#### Contract Addresses (Save These!)
\`\`\`
MarketplaceEscrow: 0x...
ReputationNFT: 0x...
Platform Wallet: 0x...
\`\`\`

### 2. Backend Deployment

#### Database Setup
\`\`\`bash
# Create production database
createdb chainmart_prod

# Run migrations
python manage.py migrate --database=production

# Create superuser
python manage.py createsuperuser
\`\`\`

#### Environment Configuration
\`\`\`bash
# Update .env for production
DEBUG=False
SECRET_KEY=generate-secure-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Blockchain
BLOCKCHAIN_NETWORK=polygon
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com/
MARKETPLACE_CONTRACT_ADDRESS=0x...
REPUTATION_NFT_ADDRESS=0x...
PLATFORM_WALLET_ADDRESS=0x...
BLOCKCHAIN_PRIVATE_KEY=your_private_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
\`\`\`

#### Gunicorn Setup
\`\`\`bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --worker-class sync
\`\`\`

#### Nginx Configuration
\`\`\`nginx
upstream django {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    client_max_body_size 100M;
    
    location /static/ {
        alias /var/www/chainmart/staticfiles/;
    }
    
    location /media/ {
        alias /var/www/chainmart/media/;
    }
    
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

### 3. Frontend Deployment

#### Build for Production
\`\`\`bash
cd frontend

# Build
npm run build

# Test production build locally
npm start
\`\`\`

#### Vercel Deployment (Recommended)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
NEXT_PUBLIC_REPUTATION_NFT_CONTRACT=0x...
\`\`\`

#### Self-Hosted Deployment
\`\`\`bash
# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "chainmart-frontend" -- start
pm2 save
pm2 startup
\`\`\`

### 4. SSL/TLS Setup

\`\`\`bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
\`\`\`

### 5. Monitoring & Logging

#### Application Monitoring
\`\`\`bash
# Install monitoring tools
pip install sentry-sdk

# Configure in Django settings
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
)
\`\`\`

#### Log Aggregation
\`\`\`bash
# Using ELK Stack or similar
# Configure Django logging to send to centralized service
\`\`\`

### 6. Backup Strategy

\`\`\`bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/backups/chainmart"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
pg_dump chainmart_prod > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://chainmart-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
\`\`\`

### 7. Performance Optimization

#### Caching Strategy
\`\`\`python
# Redis caching for frequently accessed data
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache product listings for 5 minutes
@cache_page(60 * 5)
def product_list(request):
    ...
\`\`\`

#### Database Optimization
\`\`\`sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
\`\`\`

### 8. Security Hardening

#### Django Security
\`\`\`python
# settings.py
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    'default-src': ("'self'",),
    'script-src': ("'self'", "'unsafe-inline'"),
    'style-src': ("'self'", "'unsafe-inline'"),
}
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
\`\`\`

#### Smart Contract Security
- [ ] Audit by professional security firm
- [ ] Test for reentrancy attacks
- [ ] Verify gas limits
- [ ] Test edge cases
- [ ] Formal verification if possible

### 9. Monitoring Blockchain

\`\`\`python
# Monitor smart contract events
from web3 import Web3

def monitor_contract_events():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    contract = w3.eth.contract(address=MARKETPLACE_ADDRESS, abi=MARKETPLACE_ABI)
    
    # Watch for OrderPlaced events
    event_filter = contract.events.OrderPlaced.create_filter(from_block='latest')
    
    while True:
        for event in event_filter.get_new_entries():
            # Process event
            handle_order_placed(event)
        time.sleep(12)  # Block time on Polygon
\`\`\`

### 10. Disaster Recovery

#### Backup Restoration
\`\`\`bash
# Restore database from backup
gunzip db_backup.sql.gz
psql chainmart_prod < db_backup.sql
\`\`\`

#### Contract Upgrade Strategy
- Use proxy pattern for upgradeable contracts
- Test upgrades on testnet first
- Maintain version history
- Document all changes

## Monitoring Checklist

- [ ] Application uptime monitoring
- [ ] Database performance monitoring
- [ ] Smart contract event monitoring
- [ ] API response time monitoring
- [ ] Error rate monitoring
- [ ] Blockchain transaction monitoring
- [ ] Wallet balance monitoring
- [ ] Disk space monitoring

## Incident Response

### Smart Contract Issues
1. Pause contract if critical bug found
2. Notify users immediately
3. Deploy fix on testnet
4. Audit fix thoroughly
5. Deploy to mainnet
6. Resume operations

### Database Issues
1. Activate backup database
2. Restore from latest backup
3. Verify data integrity
4. Resume operations
5. Investigate root cause

### API Issues
1. Check error logs
2. Restart services if needed
3. Failover to backup server
4. Investigate root cause
5. Deploy fix

## Performance Targets

- API response time: < 200ms
- Page load time: < 2s
- Smart contract transaction: < 30s confirmation
- Database query: < 100ms
- Cache hit rate: > 80%
