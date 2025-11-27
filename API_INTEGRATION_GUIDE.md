# ChainMart API Integration Guide

## Base URL
- Development: `http://localhost:8000/api/v1`
- Production: `https://api.chainmart.com/api/v1`

## Authentication
All endpoints use JWT tokens. Include in headers:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Endpoints

### Users
- `POST /users/` - Register new user
- `GET /users/me/` - Get current user
- `PUT /users/<id>/` - Update user profile
- `POST /users/verify_wallet/` - Verify wallet signature
- `GET|PUT /users/notifications/` - Manage notification preferences

### Products
- `GET /products/` - List all products (with filters)
- `POST /products/` - Create new product (seller only)
- `GET /products/<id>/` - Get product details
- `PUT /products/<id>/` - Update product
- `DELETE /products/<id>/` - Delete product
- `GET /products/my_products/` - Get seller's products
- `POST /products/<id>/deactivate/` - Deactivate product

### Orders
- `GET /orders/buyer_orders/` - Get buyer's orders
- `GET /orders/seller_orders/` - Get seller's orders
- `POST /orders/` - Create order (blockchain)
- `POST /orders/<id>/complete_order/` - Complete order
- `POST /orders/<id>/raise_dispute/` - Raise dispute

### Sellers
- `GET /sellers/my_store/` - Get seller store profile
- `PUT /sellers/<id>/` - Update store profile

### Reviews
- `GET /reviews/` - Get all reviews
- `POST /reviews/` - Create review
- `GET /reviews/?product=<id>` - Get product reviews

### Messages
- `GET /messages/` - Get all messages
- `POST /messages/` - Send message

### Blockchain
- `POST /blockchain/record_transaction/` - Record blockchain transaction
- `GET /blockchain/<tx_hash>/` - Get transaction details

## Real-time WebSocket Events

### Order Updates
- Connect to: `ws://localhost:8000/ws/orders/`
- Events: order_created, order_completed, order_disputed

### Product Updates
- Connect to: `ws://localhost:8000/ws/products/`
- Events: product_listed, product_updated, product_deactivated

## Frontend Integration Points

### User Registration & Auth
\`\`\`typescript
// 1. Register user
POST /users/ { username, email, password }

// 2. Connect wallet
POST /users/verify_wallet/ { signature, message, wallet_address }

// 3. Get auth token (handled via email/password)
\`\`\`

### Browse Products
\`\`\`typescript
// Get all products with filters
GET /products/?category=electronics&min_price=100&max_price=1000&search=laptop&ordering=-price

// Get product details
GET /products/<id>/
\`\`\`

### Create Product (Seller)
\`\`\`typescript
// Create listing
POST /products/ { 
  title, description, category, price, currency, thumbnail, stock 
}
\`\`\`

### Purchase Product (Buyer)
\`\`\`typescript
// 1. Place order via blockchain
POST /orders/ { listing_id, product_id }

// 2. Record blockchain transaction
POST /blockchain/record_transaction/ { 
  transaction_hash, from_address, to_address, amount, token, status 
}

// 3. Get orders
GET /orders/buyer_orders/
\`\`\`

### Seller Dashboard
\`\`\`typescript
// Get seller products
GET /products/my_products/

// Get seller orders
GET /orders/seller_orders/

// Get store profile
GET /sellers/my_store/
\`\`\`

## Real-time Features

### Order Status Updates
Frontend connects to WebSocket and listens for order updates:
\`\`\`typescript
const ws = new WebSocket('ws://localhost:8000/ws/orders/');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update UI with order status
};
\`\`\`

## Error Handling
All errors return standard format:
\`\`\`json
{
  "error": "Error message",
  "details": {}
}
\`\`\`

## Rate Limiting
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
