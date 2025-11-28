"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { useRouter } from "next/navigation"
import { Package, DollarSign, Star } from "lucide-react"

export default function BecomeSeller() {
  const { isConnected, account } = useWeb3()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeName, setStoreName] = useState("")
  const [storeDescription, setStoreDescription] = useState("")

  const handleBecomeSeller = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !account) {
      setError("Please connect your wallet first")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/v1/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          storeDescription,
          walletAddress: account,
        }),
      })

      if (response.ok) {
        router.push("/dashboard/seller/products")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to become a seller")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Please connect your wallet to become a seller</p>
          <Link href="/connect-wallet" className="btn-primary">
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container max-w-2xl">
        <div className="card p-12">
          <h1 className="text-4xl font-bold mb-2 text-center">Start Selling on ChainMart</h1>
          <p className="text-center text-muted-foreground mb-8">
            Become a seller and reach thousands of buyers on our Web3 marketplace
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Package className="w-12 h-12 text-accent" />
              </div>
              <p className="font-medium">List Products</p>
              <p className="text-sm text-muted-foreground">Create unlimited listings</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <DollarSign className="w-12 h-12 text-accent" />
              </div>
              <p className="font-medium">Earn Revenue</p>
              <p className="text-sm text-muted-foreground">Instant payouts to wallet</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Star className="w-12 h-12 text-accent" />
              </div>
              <p className="font-medium">Build Reputation</p>
              <p className="text-sm text-muted-foreground">Earn seller badges</p>
            </div>
          </div>

          <form onSubmit={handleBecomeSeller} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="input"
                placeholder="Your awesome store"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Store Description</label>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="input min-h-32"
                placeholder="Tell buyers about your store..."
                required
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-4">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button type="submit" disabled={isLoading} className="btn-primary py-3 px-8 flex-1">
                {isLoading ? "Activating..." : "Activate Seller Account"}
              </button>
              <Link href="/profile" className="btn-secondary py-3 px-8">
                Back to Dashboard
              </Link>
            </div>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-8">
            You can be both a buyer and seller simultaneously. Your buyer activity won't be affected.
          </p>
        </div>
      </div>
    </div>
  )
}
