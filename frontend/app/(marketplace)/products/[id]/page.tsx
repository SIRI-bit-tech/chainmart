"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import type { Product } from "@/types/global"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { account, isConnected } = useWeb3()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/v1/products/${params.id}`)
        if (!response.ok) throw new Error("Product not found")

        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      router.push("/auth/connect-wallet")
      return
    }

    try {
      setIsPurchasing(true)

      // Create order via smart contract
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: product?.listingId,
          buyer_address: account,
        }),
      })

      if (response.ok) {
        const order = await response.json()
        router.push(`/dashboard/orders/${order.id}`)
      } else {
        const error = await response.json()
        setError(error.error || "Purchase failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed")
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 h-96 shimmer" />
            <div className="space-y-4">
              <div className="card p-4 h-12 shimmer" />
              <div className="card p-4 h-24 shimmer" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <p className="text-error mb-4">{error || "Product not found"}</p>
          <Link href="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link href="/products" className="text-accent hover:underline mb-6 inline-block">
          ← Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="card p-4 mb-4 bg-muted-background aspect-square flex items-center justify-center">
              {product.images && product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl">📦</div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`card p-2 aspect-square flex items-center justify-center cursor-pointer transition-all ${
                      selectedImage === idx ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt={`${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

            {/* Seller */}
            <Link href={`/sellers/${product.seller.id}`} className="card p-4 mb-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {product.seller.avatar && (
                  <img
                    src={product.seller.avatar || "/placeholder.svg"}
                    alt={product.seller.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{product.seller.displayName || product.seller.username}</p>
                  <p className="text-sm text-muted-foreground">{product.seller.reputation?.score || 0} reputation</p>
                </div>
              </div>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-warning text-xl">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.floor(product.rating) ? "★" : "☆"}</span>
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Price & Purchase */}
            <div className="card p-6 bg-muted-background mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-accent">{product.price}</span>
                <span className="text-lg text-muted-foreground">{product.currency}</span>
              </div>

              {error && (
                <div className="bg-error/10 border border-error rounded-lg p-3 mb-4">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={isPurchasing || !isConnected}
                className="w-full btn-primary py-3 mb-3"
              >
                {isPurchasing ? "Processing..." : "Buy Now"}
              </button>

              {!isConnected && (
                <Link href="/auth/connect-wallet" className="w-full btn-secondary py-3 block text-center">
                  Connect Wallet to Purchase
                </Link>
              )}
            </div>

            {/* Product Details */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sales</span>
                  <span className="font-medium">{product.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Hash</span>
                  <span className="font-mono text-xs">{product.productHash.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
