import io, { type Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (token?: string): Socket => {
  if (socket?.connected) {
    return socket
  }

  const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  socket = io(socketUrl, {
    auth: token
      ? {
          token,
        }
      : undefined,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket", "polling"],
  })

  socket.on("connect", () => {
    console.log("[v0] Socket connected:", socket?.id)
  })

  socket.on("disconnect", () => {
    console.log("[v0] Socket disconnected")
  })

  socket.on("error", (error: any) => {
    console.error("[v0] Socket error:", error)
  })

  return socket
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}

export const onOrderUpdate = (callback: (data: any) => void) => {
  const socketInstance = getSocket() || initializeSocket()
  socketInstance.on("order_update", callback)

  return () => {
    socketInstance.off("order_update", callback)
  }
}

export const onProductUpdate = (callback: (data: any) => void) => {
  const socketInstance = getSocket() || initializeSocket()
  socketInstance.on("product_update", callback)

  return () => {
    socketInstance.off("product_update", callback)
  }
}

export const emitOrderStatusChange = (orderId: string, status: string) => {
  const socketInstance = getSocket()
  if (socketInstance?.connected) {
    socketInstance.emit("order_status_change", { orderId, status })
  }
}

export const emitProductInventoryChange = (productId: string, quantity: number) => {
  const socketInstance = getSocket()
  if (socketInstance?.connected) {
    socketInstance.emit("product_inventory_change", { productId, quantity })
  }
}
