// ============================================
// BLOCKCHAIN & WEB3 TYPES
// ============================================

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export interface EthereumProvider {
  isMetaMask?: boolean
  isConnected: () => boolean
  request: (args: EthereumRequest) => Promise<unknown>
  on: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void
}

export interface EthereumRequest {
  method: string
  params?: unknown[]
}

export interface WalletConnectOptions {
  projectId: string
  chains: number[]
  appName: string
  appDescription: string
  appUrl: string
}

export interface ContractABI {
  type: string
  name?: string
  inputs?: AbiInput[]
  outputs?: AbiOutput[]
  stateMutability?: string
  constant?: boolean
  payable?: boolean
}

interface AbiInput {
  name: string
  type: string
  indexed?: boolean
  internalType?: string
}

interface AbiOutput {
  name: string
  type: string
  internalType?: string
}

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface UserProfile {
  id: string
  walletAddress: string
  email?: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  role: UserRole
  verified: boolean
  reputation?: ReputationData
  createdAt: Date
  updatedAt: Date
}

export type UserRole = "buyer" | "seller" | "admin"

export interface ReputationData {
  score: number
  level: ReputationLevel
  totalTransactions: number
  totalEarned?: string
  successRate: number
  nftTokenId?: string
}

export type ReputationLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"

export interface AuthSession {
  user: UserProfile
  token: string
  expiresAt: Date
}

// ============================================
// MARKETPLACE TYPES
// ============================================

export interface Product {
  id: string
  listingId: string
  seller: UserProfile
  title: string
  description: string
  category: ProductCategory
  price: string
  currency: "MATIC" | "USDC" | "USDT" | "ETH"
  images: string[]
  thumbnail?: string
  stock?: number
  rating: number
  reviewCount: number
  productHash: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = "electronics" | "clothing" | "books" | "art" | "collectibles" | "services" | "other"

export interface ProductFilters {
  search?: string
  category?: ProductCategory
  minPrice?: string
  maxPrice?: string
  sortBy?: "newest" | "price-asc" | "price-desc" | "rating" | "sales"
  page?: number
  limit?: number
}

export interface CartItem {
  productId: string
  listingId: string
  seller: UserProfile
  title: string
  price: string
  currency: string
  quantity: number
  image?: string
}

export interface Cart {
  items: CartItem[]
  subtotal: string
  platformFee: string
  total: string
}

// ============================================
// ORDER & TRANSACTION TYPES
// ============================================

export interface Order {
  id: string
  orderId: string
  listingId: string
  buyer: UserProfile
  seller: UserProfile
  product: Product
  amount: string
  currency: "MATIC" | "USDC" | "USDT" | "ETH"
  paymentToken: string
  status: OrderStatus
  disputeStatus: DisputeStatus
  transactionHash?: string
  createdAt: Date
  completedAt?: Date
  disputer?: string
  disputeReason?: string
}

export type OrderStatus = "ACTIVE" | "PAYMENT_HELD" | "COMPLETED" | "DISPUTED" | "REFUNDED" | "CANCELLED"

export type DisputeStatus = "NONE" | "RAISED" | "INVESTIGATING" | "RESOLVED"

export interface Dispute {
  id: string
  orderId: string
  initiator: UserProfile
  reason: string
  evidence?: string[]
  resolution?: string
  winner?: string
  status: DisputeStatus
  createdAt: Date
  resolvedAt?: Date
}

export interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  value: string
  token: string
  type: TransactionType
  status: TransactionStatus
  orderId?: string
  createdAt: Date
  confirmedAt?: Date
  blockNumber?: number
  gasUsed?: string
}

export type TransactionType = "purchase" | "withdrawal" | "refund" | "platform_fee"
export type TransactionStatus = "pending" | "confirmed" | "failed"

// ============================================
// SELLER TYPES
// ============================================

export interface SellerProfile {
  id: string
  user: UserProfile
  totalEarned: string
  totalWithdrawn: string
  totalEscrow: string
  reputation: ReputationData
  bankAccount?: BankAccount
  taxInfo?: TaxInformation
  createdAt: Date
  updatedAt: Date
}

export interface BankAccount {
  accountName: string
  accountNumber: string
  bankCode: string
  country: string
  verified: boolean
}

export interface TaxInformation {
  taxId: string
  country: string
  documentUrl?: string
  verified: boolean
}

// ============================================
// REVIEW & RATING TYPES
// ============================================

export interface Review {
  id: string
  orderId: string
  reviewer: UserProfile
  reviewee: UserProfile
  rating: number
  title: string
  comment: string
  helpful: number
  type: "product" | "seller" | "buyer"
  createdAt: Date
  updatedAt: Date
}

// ============================================
// MESSAGING TYPES
// ============================================

export interface Message {
  id: string
  conversationId: string
  sender: UserProfile
  receiver: UserProfile
  content: string
  attachments?: MessageAttachment[]
  isRead: boolean
  createdAt: Date
}

export interface MessageAttachment {
  id: string
  url: string
  type: "image" | "document" | "file"
  name: string
}

export interface Conversation {
  id: string
  participants: UserProfile[]
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardMetrics {
  totalSales: number
  totalRevenue: string
  totalOrders: number
  pendingOrders: number
  disputes: number
  averageRating: number
}

export interface SalesData {
  date: string
  amount: string
  orders: number
  currency: string
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export interface WebSocketMessage {
  type: WebSocketEventType
  data: unknown
  timestamp: Date
}

export type WebSocketEventType =
  | "order_created"
  | "order_completed"
  | "payment_received"
  | "dispute_raised"
  | "message_received"
  | "notification"
  | "price_updated"
  | "inventory_changed"

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

export type NotificationType = "order_status" | "message" | "review" | "dispute" | "system" | "payment"
