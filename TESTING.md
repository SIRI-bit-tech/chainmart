# ChainMart Testing Guide

## Unit Tests

### Backend Tests

\`\`\`bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.products

# Run with coverage
coverage run --source='.' manage.py test
coverage report
\`\`\`

### Frontend Tests

\`\`\`bash
# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- products.test.ts
\`\`\`

## Integration Tests

### Smart Contract Tests

\`\`\`bash
cd smart-contracts

# Run Hardhat tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run on testnet
npx hardhat test --network amoy
\`\`\`

### API Integration Tests

\`\`\`python
# tests/test_orders.py
from django.test import TestCase
from rest_framework.test import APIClient

class OrderIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = create_test_user()
        self.product = create_test_product()
    
    def test_purchase_product(self):
        response = self.client.post('/api/v1/orders/', {
            'listing_id': self.product.listing_id,
            'buyer_address': self.user.wallet_address,
        })
        self.assertEqual(response.status_code, 201)
\`\`\`

## End-to-End Tests

### Buyer Flow
1. Connect wallet
2. Browse products
3. Add to cart
4. Checkout
5. Confirm transaction
6. Verify order created
7. Track order status

### Seller Flow
1. Connect wallet
2. Create product listing
3. Verify listing appears
4. Receive order
5. Complete order
6. Verify payment received

### Dispute Flow
1. Create order
2. Raise dispute
3. Submit evidence
4. Admin resolves
5. Verify outcome

## Load Testing

\`\`\`bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/v1/products

# Using Locust
pip install locust

# Create locustfile.py
from locust import HttpUser, task

class ChainMartUser(HttpUser):
    @task
    def browse_products(self):
        self.client.get("/api/v1/products")
    
    @task
    def view_product(self):
        self.client.get("/api/v1/products/1")

# Run tests
locust -f locustfile.py --host=http://localhost:8000
\`\`\`

## Security Testing

### OWASP Top 10 Checks
- [ ] SQL Injection
- [ ] Cross-Site Scripting (XSS)
- [ ] Cross-Site Request Forgery (CSRF)
- [ ] Broken Authentication
- [ ] Sensitive Data Exposure
- [ ] XML External Entities (XXE)
- [ ] Broken Access Control
- [ ] Security Misconfiguration
- [ ] Insecure Deserialization
- [ ] Using Components with Known Vulnerabilities

### Smart Contract Security
- [ ] Reentrancy attacks
- [ ] Integer overflow/underflow
- [ ] Unchecked external calls
- [ ] Delegatecall vulnerabilities
- [ ] Timestamp dependence
- [ ] Front-running vulnerabilities

## Testnet Deployment

### Polygon Amoy Testnet

\`\`\`bash
# Get test MATIC from faucet
# https://faucet.polygon.technology/

# Deploy contracts
npx hardhat run scripts/deploy.js --network amoy

# Verify on PolygonScan
npx hardhat verify --network amoy CONTRACT_ADDRESS

# Test transactions
# Use MetaMask to switch to Amoy testnet
# Test buying/selling flow
\`\`\`

## Monitoring Tests

\`\`\`python
# Continuous monitoring script
import time
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def handle(self, *args, **options):
        while True:
            # Check API health
            response = requests.get('http://localhost:8000/api/health')
            if response.status_code != 200:
                alert_admin('API is down')
            
            # Check database
            try:
                User.objects.count()
            except:
                alert_admin('Database connection failed')
            
            # Check blockchain
            try:
                w3.eth.block_number
            except:
                alert_admin('Blockchain RPC connection failed')
            
            time.sleep(60)
\`\`\`

## Test Coverage Goals

- Backend: > 80%
- Frontend: > 70%
- Smart Contracts: > 90%
- API Endpoints: 100%
