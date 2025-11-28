"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import type { Product } from "@/types/global"

export default function SellerProductsPage() {
  const { account, isConnected } = useWeb3()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isConnected || !account) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/v1/products/seller/${account}`)
        if (!response.ok) throw new Error("Failed to fetch products")

        const data = await response.json()
        setProducts(data.items || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [isConnected, account])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link href="/seller/products/new" className="btn-primary">
          + List New Product
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 h-24 shimmer" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-error mb-4">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-4">No products listed yet</h2>
          <p className="text-muted-foreground mb-6">Start selling by listing your first product</p>
          <Link href="/seller/products/new" className="btn-primary">
            List Your First Product
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="card p-6 flex gap-4 hover:shadow-lg transition-shadow">
              {product.thumbnail && (
                <img
                  src={product.thumbnail || "/placeholder.svg"}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded"
                />
              )}

              <div className="flex-1">
                <h3 className="font-semibold mb-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.description.slice(0, 100)}...</p>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-accent">
                    {product.price} {product.currency}
                  </span>
                  <span className="text-sm text-muted-foreground">{product.reviewCount} sales</span>
                  <span className={`badge ${product.isActive ? "badge-success" : "badge-error"}`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/seller/products/${product.id}/edit`} className="btn-secondary py-2 px-4">
                  Edit
                </Link>
                <button className="btn-secondary py-2 px-4">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
