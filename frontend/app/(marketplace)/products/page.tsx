"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { PRODUCT_CATEGORIES } from "@/config/constants"
import type { Product, ProductFilters } from "@/types/global"
import { useProductUpdates } from "@/hooks/useSocket"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get("search") || "",
    category: (searchParams.get("category") as any) || undefined,
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: "newest",
    page: 1,
    limit: 20,
  })

  useProductUpdates((data: any) => {
    console.log("[v0] Received product update:", data)
    setProducts((prevProducts) =>
      prevProducts.map((product) => (product.id === data.productId ? { ...product, stock: data.quantity } : product)),
    )
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()

        if (filters.search) params.append("search", filters.search)
        if (filters.category) params.append("category", filters.category)
        if (filters.minPrice) params.append("min_price", filters.minPrice)
        if (filters.maxPrice) params.append("max_price", filters.maxPrice)
        if (filters.sortBy) params.append("sort_by", filters.sortBy)
        params.append("page", filters.page?.toString() || "1")
        params.append("limit", filters.limit?.toString() || "20")

        const response = await fetch(`/api/v1/products?${params}`)
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
  }, [filters])

  const handleFilterChange = (key: keyof ProductFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted-background">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse {products.length} products from verified sellers</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="font-semibold mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="input text-sm"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category || ""}
                  onChange={(e) => handleFilterChange("category", e.target.value || undefined)}
                  className="input text-sm"
                >
                  <option value="">All Categories</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="input text-sm flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="input text-sm flex-1"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="input text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="sales">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-4 shimmer h-80" />
                ))}
              </div>
            ) : error ? (
              <div className="card p-8 text-center">
                <p className="text-error mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Link href="/products" className="btn-secondary">
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-48 bg-muted-background overflow-hidden">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail || "/placeholder.svg"}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>

                      {/* Seller */}
                      <p className="text-sm text-muted-foreground mb-3">
                        by {product.seller.displayName || product.seller.username}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-warning">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < Math.floor(product.rating) ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-accent">
                          {product.price} {product.currency}
                        </span>
                        <span className="text-xs badge-primary">{product.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
