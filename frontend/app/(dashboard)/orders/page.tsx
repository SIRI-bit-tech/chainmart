"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useWeb3 } from "@/hooks/useWeb3"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ORDER_STATUS_LABELS } from "@/config/constants"
import type { Order } from "@/types/global"
import { useOrderUpdates } from "@/hooks/useSocket"

export default function OrdersPage() {
  const { account, isConnected } = useWeb3()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")

  useOrderUpdates((data: any) => {
    console.log("[v0] Received order update:", data)
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === data.orderId ? { ...order, status: data.status } : order)),
    )
  })

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isConnected || !account) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/v1/orders/buyer/my-orders?status=${filter}`)
        if (!response.ok) throw new Error("Failed to fetch orders")

        const data = await response.json()
        setOrders(data.items || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [isConnected, account, filter])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Please connect your wallet to view orders</p>
          <Link href="/connect-wallet" className="btn-primary">
            Connect Wallet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {(["all", "pending", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-4 px-4 font-medium transition-colors ${
                filter === tab ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
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
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted-foreground mb-4">No orders found</p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Order #{order.orderId}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{order.product?.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-accent mb-2">
                      {formatCurrency(order.amount)} {order.currency}
                    </p>
                    <span
                      className={`badge ${
                        order.status === "COMPLETED"
                          ? "badge-success"
                          : order.status === "DISPUTED"
                            ? "badge-error"
                            : "badge-primary"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
