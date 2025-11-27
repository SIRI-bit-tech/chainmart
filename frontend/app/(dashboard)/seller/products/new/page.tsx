"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/hooks/useWeb3"
import { PRODUCT_CATEGORIES } from "@/config/constants"
import type { ProductCategory } from "@/types/global"

export default function NewProductPage() {
  const router = useRouter()
  const { account, isConnected } = useWeb3()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other" as ProductCategory,
    price: "",
    currency: "MATIC",
    images: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !account) {
      setError("Please connect your wallet")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Create product metadata hash (IPFS)
      const productMetadata = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        images: formData.images,
        timestamp: Date.now(),
      }

      // In production, upload to IPFS and get hash
      const productHash = `0x${Buffer.from(JSON.stringify(productMetadata)).toString("hex")}`

      // Create listing via API
      const response = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_address: account,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          currency: formData.currency,
          images: formData.images,
          product_hash: productHash,
        }),
      })

      if (response.ok) {
        const product = await response.json()
        router.push(`/dashboard/seller/products/${product.id}`)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create product")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">List New Product</h1>

      <div className="card p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
              placeholder="Enter product title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-32"
              required
              placeholder="Describe your product in detail"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="input">
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                required
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="input">
                <option value="MATIC">MATIC</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error rounded-lg p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button type="submit" disabled={isLoading} className="btn-primary py-3 px-8">
              {isLoading ? "Creating..." : "List Product"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary py-3 px-8">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
