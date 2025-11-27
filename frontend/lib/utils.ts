import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format address for display
 */
export function formatAddress(address: string, length = 6): string {
  if (!address) return ""
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

/**
 * Format currency
 */
export function formatCurrency(amount: string | number, decimals = 2): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [key, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value)
    if (interval >= 1) {
      return `${interval} ${key}${interval > 1 ? "s" : ""} ago`
    }
  }

  return "just now"
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Convert to Wei
 */
export function toWei(amount: string | number): string {
  const ether = typeof amount === "string" ? amount : amount.toString()
  const wei = Number.parseFloat(ether) * 1e18
  return wei.toFixed(0)
}

/**
 * Convert from Wei
 */
export function fromWei(amount: string | number): string {
  const wei = typeof amount === "string" ? amount : amount.toString()
  const ether = Number.parseFloat(wei) / 1e18
  return ether.toFixed(18).replace(/\.?0+$/, "")
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
