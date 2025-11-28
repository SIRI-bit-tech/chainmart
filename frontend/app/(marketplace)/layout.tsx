"use client"

import type React from "react"

import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { formatAddress } from "@/lib/utils"

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { account, isConnected, connect } = useWeb3()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-accent">
            ChainMart
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/products" className="text-foreground hover:text-accent transition-colors">
              Browse
            </Link>
            <Link href="/sellers" className="text-foreground hover:text-accent transition-colors">
              Sellers
            </Link>
            <Link href="/profile" className="text-foreground hover:text-accent transition-colors">
              Dashboard
            </Link>

            {isConnected && account ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <p className="font-mono text-accent">{formatAddress(account)}</p>
                </div>
                <Link href="/profile" className="btn-secondary py-2 px-4">
                  Profile
                </Link>
              </div>
            ) : (
              <button onClick={connect} className="btn-primary py-2 px-4">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {children}
    </div>
  )
}
