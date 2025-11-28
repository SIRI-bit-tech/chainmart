"use client"

import { useState } from "react"
import { useConnect, useDisconnect } from "wagmi"
import { Wallet, Smartphone, X } from "lucide-react"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect?: () => void
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConnect = async (connectorId: string) => {
    try {
      setIsConnecting(true)
      setError(null)

      const connector = connectors.find((c) => c.id === connectorId)
      if (!connector) {
        throw new Error("Connector not found")
      }

      await disconnect()
      
      connect(
        { connector },
        {
          onSuccess: () => {
            onConnect?.()
            onClose()
          },
          onError: (err) => {
            setError(err.message)
          },
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-background border-2 border-border rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
        <p className="text-muted-foreground mb-6">Choose your preferred wallet</p>

        <div className="space-y-3">
          {/* Injected Wallet (MetaMask, Coinbase, etc.) */}
          <button
            onClick={() => handleConnect("injected")}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Injected Wallet</p>
              <p className="text-sm text-muted-foreground">MetaMask, Coinbase, Brave, etc.</p>
            </div>
          </button>

          {/* WalletConnect (All Wallets) */}
          <button
            onClick={() => handleConnect("walletConnect")}
            disabled={isConnecting}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">WalletConnect</p>
              <p className="text-sm text-muted-foreground">100+ wallets via QR code</p>
            </div>
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 text-xs text-foreground">
          <p className="font-semibold mb-1 text-accent">💡 Tip:</p>
          <p className="text-muted-foreground"><strong className="text-foreground">Desktop:</strong> Use "Injected Wallet" if you have a browser extension</p>
          <p className="text-muted-foreground"><strong className="text-foreground">Mobile:</strong> Use "WalletConnect" to scan QR code with your wallet app</p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">
            {error}
          </div>
        )}

        {isConnecting && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Connecting...
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground text-center">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
