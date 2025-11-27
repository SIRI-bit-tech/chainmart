"use client"

import { useEffect } from "react"
import { getSocket, initializeSocket, onOrderUpdate, onProductUpdate } from "@/lib/socket"
import type { Socket } from "socket.io-client"

export const useSocket = (token?: string): Socket | null => {
  useEffect(() => {
    const socket = initializeSocket(token)
    return () => {
      // Keep connection alive; don't disconnect on unmount
    }
  }, [token])

  return getSocket()
}

export const useOrderUpdates = (callback: (data: any) => void) => {
  useEffect(() => {
    const unsubscribe = onOrderUpdate(callback)
    return unsubscribe
  }, [callback])
}

export const useProductUpdates = (callback: (data: any) => void) => {
  useEffect(() => {
    const unsubscribe = onProductUpdate(callback)
    return unsubscribe
  }, [callback])
}
