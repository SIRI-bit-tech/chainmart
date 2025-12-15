"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { useApiRequest } from "@/hooks/useApiClient"
import { formatCurrency } from "@/lib/utils"
import { normalizeUserProfile } from "@/lib/user-utils"
import type { UserProfile, DashboardMetrics } from "@/types/global"

export default function DashboardPage() {
  const { account, isConnected } = useWeb3()
  const apiClient = useApiRequest()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !account) {
        setIsLoading(false)
        return
      }

      if (!apiClient.isReady) {
        setIsLoading(false)
        setError("Missing API configuration or session")
        return
      }

      try {
        setIsLoading(true)
        const [profileData, metricsData] = await Promise.all([
          apiClient.get("/users/me/"),
          apiClient.get(`/dashboard/${activeTab}/stats/`),
        ])

        setProfile(normalizeUserProfile(profileData))
        setMetrics(metricsData)
        setError(null) // Clear any previous errors
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isConnected, account, activeTab, apiClient.isReady])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Please connect your wallet to access your dashboard</p>
          <Link href="/connect-wallet" className="btn-primary">
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.displayName || "User"}</h1>
        <p className="text-muted-foreground">Manage your marketplace activity as both buyer and seller</p>
      </div>

      {/* Role Switcher */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Dashboard Mode</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "buyer"
                ? "bg-accent text-white"
                : "bg-muted-background text-foreground hover:bg-muted-background/80"
            }`}
          >
            Buyer Activity
          </button>
          <button
            onClick={() => setActiveTab("seller")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "seller"
                ? "bg-accent text-white"
                : "bg-muted-background text-foreground hover:bg-muted-background/80"
            }`}
          >
            Seller Activity
          </button>
        </div>
      </div>

      {/* Buyer Metrics */}
      {activeTab === "buyer" && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Purchases</p>
            <p className="text-3xl font-bold">{metrics?.totalOrders || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
            <p className="text-3xl font-bold">{formatCurrency(metrics?.totalSpent || 0)}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending Orders</p>
            <p className="text-3xl font-bold">{metrics?.pendingOrders || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Reviews Given</p>
            <p className="text-3xl font-bold">{metrics?.reviewsGiven || 0}</p>
          </div>
        </div>
      )}

      {/* Seller Metrics */}
      {activeTab === "seller" && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Sales</p>
            <p className="text-3xl font-bold">{metrics?.totalSales || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Revenue</p>
            <p className="text-3xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Listings</p>
            <p className="text-3xl font-bold">{metrics?.activeListings || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted-foreground mb-2">Seller Rating</p>
            <p className="text-3xl font-bold">{metrics?.sellerRating?.toFixed(2) || "0.0"} ⭐</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {activeTab === "buyer" ? (
            <>
              <Link href="/products" className="btn-primary py-3 text-center">
                Browse Products
              </Link>
              <Link href="/orders" className="btn-secondary py-3 text-center">
                View My Orders
              </Link>
            </>
          ) : (
            <>
              <Link href="/seller/products/new" className="btn-primary py-3 text-center">
                List New Product
              </Link>
              <Link href="/seller/products" className="btn-secondary py-3 text-center">
                Manage Listings
              </Link>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="card p-6 bg-error/10 border border-error">
          <p className="text-error">{error}</p>
        </div>
      )}
    </div>
  )
}
