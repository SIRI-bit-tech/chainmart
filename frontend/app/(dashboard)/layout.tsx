"use client"

import type React from "react"

import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { formatAddress } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConnected, account, balance } = useWeb3()
  const router = useRouter()
  const [isSeller, setIsSeller] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push("/auth/connect-wallet")
      return
    }

    const checkSellerStatus = async () => {
      try {
        const res = await fetch("/api/v1/users/me")
        if (res.ok) {
          const user = await res.json()
          setIsSeller(user.isSeller || false)
        }
      } catch (err) {
        console.error("Failed to check seller status:", err)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    if (isConnected) {
      checkSellerStatus()
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-accent">
            ChainMart
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-foreground hover:text-accent transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/orders" className="text-foreground hover:text-accent transition-colors">
              Orders
            </Link>
            {isSeller && (
              <Link href="/dashboard/seller/products" className="text-foreground hover:text-accent transition-colors">
                My Store
              </Link>
            )}
            <Link href="/dashboard/profile" className="text-foreground hover:text-accent transition-colors">
              Profile
            </Link>
            <div className="text-sm text-muted-foreground">
              {formatAddress(account || "", 8)} • {Number.parseFloat(balance).toFixed(4)} MATIC
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="font-semibold mb-4">Navigation</h3>
              <nav className="space-y-2">
                {/* Buyer Section */}
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold px-4 py-2">Buyer</p>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 rounded hover:bg-muted-background transition-colors"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="block px-4 py-2 rounded hover:bg-muted-background transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/products"
                    className="block px-4 py-2 rounded hover:bg-muted-background transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>

                {/* Seller Section */}
                {isSeller && !isCheckingStatus && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-semibold px-4 py-2 mt-4">Seller</p>
                    <Link
                      href="/dashboard/seller/products"
                      className="block px-4 py-2 rounded hover:bg-muted-background transition-colors"
                    >
                      My Products
                    </Link>
                    <Link
                      href="/dashboard/seller/products/new"
                      className="block px-4 py-2 rounded hover:bg-muted-background transition-colors"
                    >
                      List Product
                    </Link>
                  </div>
                )}

                {/* Become Seller CTA */}
                {!isSeller && !isCheckingStatus && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link
                      href="/sell"
                      className="block px-4 py-2 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-medium text-sm"
                    >
                      Start Selling
                    </Link>
                  </div>
                )}

                {/* Account Section */}
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold px-4 py-2 mt-4">Account</p>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 rounded hover:bg-muted-background transition-colors"
                  >
                    Profile Settings
                  </Link>
                  <Link href="/" className="block px-4 py-2 rounded hover:bg-muted-background transition-colors">
                    Marketplace Home
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
