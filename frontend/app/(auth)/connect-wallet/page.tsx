"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { web3Service } from "@/lib/web3"
import { formatAddress } from "@/lib/utils"
import Link from "next/link"

export default function ConnectWalletPage() {
  const router = useRouter()
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      const currentAccount = await web3Service.getAccount()
      if (currentAccount) {
        setAccount(currentAccount)
        setIsConnected(true)
      }
    }
    checkConnection()
  }, [])

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const connectedAccount = await web3Service.connectWallet()
      if (connectedAccount) {
        setAccount(connectedAccount)
        setIsConnected(true)

        // Get wallet signature for verification
        const message = `Sign this message to verify your wallet ownership on ChainMart. Timestamp: ${Date.now()}`
        const signature = await web3Service.signMessage(message)

        // Send verification to backend
        const response = await fetch("/api/auth/verify-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: connectedAccount,
            message,
            signature,
          }),
        })

        if (response.ok) {
          // Redirect to marketplace after successful verification
          router.push("/products")
        } else {
          const error = await response.json()
          setError(error.error || "Verification failed")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection failed"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-center mb-2">ChainMart</h1>
          <p className="text-center text-muted-foreground mb-8">Connect your wallet to start trading</p>

          {isConnected && account ? (
            <div className="space-y-6">
              <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
                <p className="text-sm text-success font-medium mb-2">Wallet Connected</p>
                <p className="text-lg font-mono font-semibold text-foreground">{formatAddress(account, 10)}</p>
              </div>

              <button onClick={handleConnect} disabled={isLoading} className="w-full btn-primary py-3">
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted-background rounded-lg p-4">
                <h3 className="font-semibold mb-2">Supported Wallets</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ MetaMask</li>
                  <li>✓ Trust Wallet</li>
                  <li>✓ Coinbase Wallet</li>
                  <li>✓ Any EIP-1193 compatible wallet</li>
                </ul>
              </div>

              <button onClick={handleConnect} disabled={isLoading} className="w-full btn-primary py-3">
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-error/10 border border-error rounded-lg p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Don't have a wallet?{" "}
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Download MetaMask
              </a>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/register" className="text-accent hover:underline text-sm">
              Or register with email instead
            </Link>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-semibold text-sm mb-2">Secure</h3>
            <p className="text-xs text-muted-foreground">Your private keys never leave your wallet</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-sm mb-2">Fast</h3>
            <p className="text-xs text-muted-foreground">Trade on Polygon mainnet instantly</p>
          </div>
        </div>
      </div>
    </div>
  )
}
