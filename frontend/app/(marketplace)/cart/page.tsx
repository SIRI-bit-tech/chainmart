"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import { formatCurrency } from "@/lib/utils"
import { CURRENT_CONTRACTS } from "@/config/constants"
import type { Cart, CartItem } from "@/types/global"

// Import contract ABI
const MARKETPLACE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "_listingId", type: "uint256" }],
    name: "purchaseProduct",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
]

export default function CartPage() {
  const router = useRouter()
  const { account, isConnected, balance } = useWeb3()

  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true)
        const stored = localStorage.getItem("chainmart_cart")
        if (stored) {
          setCart(JSON.parse(stored))
        } else {
          setCart({ items: [], subtotal: "0", platformFee: "0", total: "0" })
        }
      } catch (err) {
        setError("Failed to load cart")
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleRemoveItem = (productId: string) => {
    if (!cart) return

    const updatedItems = cart.items.filter((item) => item.productId !== productId)
    const updatedCart = calculateCart(updatedItems)
    setCart(updatedCart)
    localStorage.setItem("chainmart_cart", JSON.stringify(updatedCart))
  }

  const calculateCart = (items: CartItem[]): Cart => {
    const subtotal = items.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)
    const platformFee = subtotal * 0.025 // 2.5% fee
    const total = subtotal + platformFee

    return {
      items,
      subtotal: subtotal.toFixed(2),
      platformFee: platformFee.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const handleCheckout = async () => {
    if (!isConnected || !account || !cart) {
      router.push("/auth/connect-wallet")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      // Process each item in cart
      for (const item of cart.items) {
        // Get contract instance
        const contract = web3Service.getContract(CURRENT_CONTRACTS.MARKETPLACE_ESCROW, MARKETPLACE_ABI, true)

        // Send purchase transaction
        const tx = await web3Service.sendTransaction(contract, "purchaseProduct", [item.listingId])

        if (!tx) throw new Error("Transaction failed")

        // Wait for confirmation
        const receipt = await web3Service.waitForTransaction(tx)
        if (!receipt) throw new Error("Transaction not confirmed")

        // Save order to backend
        await fetch("/api/v1/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listing_id: item.listingId,
            buyer_address: account,
            transaction_hash: tx.hash,
            amount: item.price,
            currency: item.currency,
          }),
        })
      }

      // Clear cart
      localStorage.removeItem("chainmart_cart")
      router.push("/dashboard/orders")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Checkout failed"
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="card p-8 h-96 shimmer" />
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="card p-12 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Link href="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const insufficientBalance = Number.parseFloat(balance) < Number.parseFloat(cart.total)

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="card p-6 flex gap-4">
                  {item.image && (
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {item.seller.displayName || item.seller.username}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        {item.price} {item.currency}
                      </span>
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-error hover:text-error/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{cart.subtotal} MATIC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (2.5%)</span>
                  <span className="font-medium">{cart.platformFee} MATIC</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg font-bold">
                <span>Total</span>
                <span className="text-accent">{cart.total} MATIC</span>
              </div>

              {/* Wallet Balance */}
              <div className="bg-muted-background rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                <p className="text-lg font-mono font-bold">{formatCurrency(balance)} MATIC</p>
              </div>

              {insufficientBalance && (
                <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-6">
                  <p className="text-sm text-warning">Insufficient balance. You need {cart.total} MATIC</p>
                </div>
              )}

              {error && (
                <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isProcessing || insufficientBalance || !isConnected}
                className="w-full btn-primary py-3 mb-3"
              >
                {isProcessing ? "Processing..." : "Complete Purchase"}
              </button>

              {!isConnected && (
                <Link href="/auth/connect-wallet" className="w-full btn-secondary py-3 block text-center">
                  Connect Wallet
                </Link>
              )}

              <Link href="/products" className="w-full btn-secondary py-3 block text-center mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
