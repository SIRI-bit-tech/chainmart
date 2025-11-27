// ============================================
// NETWORK & BLOCKCHAIN CONFIGURATION
// ============================================

export const BLOCKCHAIN_CONFIG = {
  // Development: Polygon Amoy Testnet
  AMOY: {
    chainId: 80002,
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology/",
    blockExplorerUrl: "https://amoy.polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },

  // Production: Polygon Mainnet
  POLYGON: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com/",
    blockExplorerUrl: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
} as const

// Use mainnet for production, amoy for development
export const ACTIVE_NETWORK =
  process.env.NEXT_PUBLIC_ENV === "production" ? BLOCKCHAIN_CONFIG.POLYGON : BLOCKCHAIN_CONFIG.AMOY

// ============================================
// SMART CONTRACT ADDRESSES
// ============================================

export const SMART_CONTRACTS = {
  development: {
    MARKETPLACE_ESCROW: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000",
    REPUTATION_NFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_CONTRACT || "0x0000000000000000000000000000000000000000",
    PLATFORM_TOKEN: process.env.NEXT_PUBLIC_PLATFORM_TOKEN_CONTRACT || "0x0000000000000000000000000000000000000000",
  },
  production: {
    MARKETPLACE_ESCROW: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000",
    REPUTATION_NFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_CONTRACT || "0x0000000000000000000000000000000000000000",
    PLATFORM_TOKEN: process.env.NEXT_PUBLIC_PLATFORM_TOKEN_CONTRACT || "0x0000000000000000000000000000000000000000",
  },
} as const

// Get current environment contracts
export const CURRENT_CONTRACTS =
  process.env.NEXT_PUBLIC_ENV === "production" ? SMART_CONTRACTS.production : SMART_CONTRACTS.development

// ============================================
// ERC20 TOKEN ADDRESSES (Polygon)
// ============================================

export const ERC20_TOKENS = {
  // Mainnet tokens
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFF958023D60d76ee6",

  // Testnet (Amoy) - These are example addresses, verify actual testnet addresses
  USDC_TESTNET: "0x0000000000000000000000000000000000000000",
  USDT_TESTNET: "0x0000000000000000000000000000000000000000",
} as const

// ============================================
// COLOR SCHEME
// ============================================

export const COLORS = {
  primary: "#0F172A", // Deep Navy
  accent: "#3B82F6", // Bright Blue
  success: "#10B981", // Emerald Green
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  neutral: "#64748B", // Slate Gray
  bgLight: "#F8FAFC", // Light background
  bgDark: "#0F172A", // Dark background
  textLight: "#FFFFFF",
  textDark: "#0F172A",
  border: "#E2E8F0",
  borderDark: "#1E293B",
} as const

// ============================================
// API ENDPOINTS
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY_WALLET: `${API_BASE_URL}/auth/verify-wallet`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  },

  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    GET_USER: (id: string) => `${API_BASE_URL}/users/${id}`,
    SELLER_PROFILE: (id: string) => `${API_BASE_URL}/users/${id}/seller`,
  },

  // Products
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    CREATE: `${API_BASE_URL}/products`,
    GET: (id: string) => `${API_BASE_URL}/products/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/products/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/products/${id}`,
    SEARCH: `${API_BASE_URL}/products/search`,
    BY_CATEGORY: (category: string) => `${API_BASE_URL}/products/category/${category}`,
    BY_SELLER: (sellerId: string) => `${API_BASE_URL}/products/seller/${sellerId}`,
  },

  // Orders
  ORDERS: {
    LIST: `${API_BASE_URL}/orders`,
    CREATE: `${API_BASE_URL}/orders`,
    GET: (id: string) => `${API_BASE_URL}/orders/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/orders/${id}/status`,
    SELLER_ORDERS: `${API_BASE_URL}/orders/seller/my-orders`,
    BUYER_ORDERS: `${API_BASE_URL}/orders/buyer/my-orders`,
  },

  // Marketplace
  MARKETPLACE: {
    STATS: `${API_BASE_URL}/marketplace/stats`,
    CATEGORIES: `${API_BASE_URL}/marketplace/categories`,
    FEATURED: `${API_BASE_URL}/marketplace/featured`,
    TRENDING: `${API_BASE_URL}/marketplace/trending`,
  },

  // Reviews
  REVIEWS: {
    LIST: `${API_BASE_URL}/reviews`,
    CREATE: `${API_BASE_URL}/reviews`,
    GET: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    BY_PRODUCT: (productId: string) => `${API_BASE_URL}/reviews/product/${productId}`,
    BY_SELLER: (sellerId: string) => `${API_BASE_URL}/reviews/seller/${sellerId}`,
  },

  // Messages
  MESSAGES: {
    LIST: `${API_BASE_URL}/messages`,
    CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
    SEND: `${API_BASE_URL}/messages/send`,
    GET_CONVERSATION: (id: string) => `${API_BASE_URL}/messages/conversations/${id}`,
  },

  // Blockchain
  BLOCKCHAIN: {
    GET_BALANCE: `${API_BASE_URL}/blockchain/balance`,
    GET_TRANSACTION: (hash: string) => `${API_BASE_URL}/blockchain/tx/${hash}`,
    GAS_ESTIMATE: `${API_BASE_URL}/blockchain/gas-estimate`,
    VERIFY_TRANSACTION: `${API_BASE_URL}/blockchain/verify-tx`,
  },

  // Dashboard
  DASHBOARD: {
    SELLER_STATS: `${API_BASE_URL}/dashboard/seller/stats`,
    SELLER_SALES: `${API_BASE_URL}/dashboard/seller/sales`,
    BUYER_STATS: `${API_BASE_URL}/dashboard/buyer/stats`,
    ADMIN_STATS: `${API_BASE_URL}/dashboard/admin/stats`,
  },

  // Disputes
  DISPUTES: {
    LIST: `${API_BASE_URL}/disputes`,
    CREATE: `${API_BASE_URL}/disputes`,
    GET: (id: string) => `${API_BASE_URL}/disputes/${id}`,
    RESOLVE: (id: string) => `${API_BASE_URL}/disputes/${id}/resolve`,
  },
} as const

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ============================================
// PRODUCT CATEGORIES
// ============================================

export const PRODUCT_CATEGORIES = [
  { id: "electronics", label: "Electronics", icon: "📱" },
  { id: "clothing", label: "Clothing & Fashion", icon: "👕" },
  { id: "books", label: "Books & Media", icon: "📚" },
  { id: "art", label: "Art & Design", icon: "🎨" },
  { id: "collectibles", label: "Collectibles", icon: "🏆" },
  { id: "services", label: "Services", icon: "🛠️" },
  { id: "other", label: "Other", icon: "📦" },
] as const

// ============================================
// ORDER STATUS LABELS
// ============================================

export const ORDER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PAYMENT_HELD: "Payment Held",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
} as const

// ============================================
// REPUTATION LEVELS
// ============================================

export const REPUTATION_LEVELS = {
  BRONZE: { minScore: 0, maxScore: 99, color: "#CD7F32", label: "Bronze" },
  SILVER: { minScore: 100, maxScore: 249, color: "#C0C0C0", label: "Silver" },
  GOLD: { minScore: 250, maxScore: 499, color: "#FFD700", label: "Gold" },
  PLATINUM: { minScore: 500, maxScore: 999, color: "#E5E4E2", label: "Platinum" },
  DIAMOND: { minScore: 1000, maxScore: Number.POSITIVE_INFINITY, color: "#B9F2FF", label: "Diamond" },
} as const

// ============================================
// GAS LIMITS & FEES
// ============================================

export const GAS_CONFIG = {
  CREATE_LISTING: 200000,
  PURCHASE_PRODUCT: 300000,
  COMPLETE_ORDER: 150000,
  RAISE_DISPUTE: 120000,
  RESOLVE_DISPUTE: 150000,
  WITHDRAW_EARNINGS: 100000,
} as const

// ============================================
// TIMEOUT CONFIGURATIONS
// ============================================

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  BLOCKCHAIN_CONFIRMATION: 120000, // 2 minutes
  WEBSOCKET_RECONNECT: 5000, // 5 seconds
  DISPUTE_WINDOW: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const

// ============================================
// CACHE SETTINGS
// ============================================

export const CACHE_CONFIG = {
  PRODUCT_LIST: 5 * 60, // 5 minutes
  SELLER_PROFILE: 10 * 60, // 10 minutes
  USER_BALANCE: 1 * 60, // 1 minute
  MARKETPLACE_STATS: 15 * 60, // 15 minutes
} as const

// ============================================
// ENVIRONMENT CHECKS
// ============================================

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === "production"
export const IS_DEVELOPMENT = process.env.NEXT_PUBLIC_ENV !== "production"

// ============================================
// SECURITY
// ============================================

export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  SIGNATURE_EXPIRY: 10 * 60 * 1000, // 10 minutes
} as const
