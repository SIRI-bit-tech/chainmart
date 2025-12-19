"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useWalletClient } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { web3Service } from "@/lib/web3"
import { formatAddress } from "@/lib/utils"
import Link from "next/link"

export default function ConnectWalletPage() {
  const router = useRouter()
  const { address, isConnected: wagmiConnected, connector } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { open } = useAppKit()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize web3Service when wallet connects
  useEffect(() => {
    if (wagmiConnected && address && walletClient) {
      web3Service.setAccount(address)
      web3Service.initFromWalletClient(walletClient, connector?.id)
    }
  }, [wagmiConnected, address, walletClient, connector])

  const handleVerify = async () => {
    if (!address || !walletClient) {
      setError("Wallet not properly connected. Please try again.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Validate API URL is configured
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        setError("API URL is not configured. Please check your environment variables.")
        return
      }

      // Ensure web3Service is initialized
      await web3Service.initFromWalletClient(walletClient, connector?.id)

      // Build API URL robustly (remove trailing slash from base, ensure path starts with /)
      const baseUrl = apiUrl.replace(/\/$/, '')
      const nonceUrl = `${baseUrl}/auth/request-nonce/`

      // Step 1: Request nonce from backend
      const nonceResponse = await fetch(nonceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
        }),
      })

      if (!nonceResponse.ok) {
        let errorMessage = "Failed to request nonce"
        try {
          const contentType = nonceResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errBody = await nonceResponse.json()
            errorMessage = errBody.error || errorMessage
          } else {
            const textBody = await nonceResponse.text()
            errorMessage = textBody || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        setError(errorMessage)
        return
      }

      let nonce: string
      let message: string
      try {
        const data = await nonceResponse.json()
        nonce = data.nonce
        message = data.message
      } catch {
        setError("Invalid response format from server")
        return
      }

      // Step 2: Sign the message with nonce
      const signature = await web3Service.signMessage(message)

      // Step 3: Send verification to backend
      const verifyUrl = `${baseUrl}/auth/verify-wallet/`
      const verifyResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          message,
          signature,
          nonce,
        }),
      })

      if (verifyResponse.ok) {
        let data: any
        try {
          data = await verifyResponse.json()
        } catch {
          setError("Invalid response format from server")
          return
        }
        // Redirect to marketplace after successful verification
        // Note: Token is handled by the backend API route
        router.push("/products")
      } else {
        let errorMessage = "Verification failed"
        try {
          const contentType = verifyResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errBody = await verifyResponse.json()
            errorMessage = errBody.error || errorMessage
          } else {
            const textBody = await verifyResponse.text()
            errorMessage = textBody || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed"
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

          {wagmiConnected && address ? (
            <div className="space-y-6">
              <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
                <p className="text-sm text-success font-medium mb-2">Wallet Connected</p>
                <p className="text-lg font-mono font-semibold text-foreground">{formatAddress(address, 10)}</p>
              </div>

              <button onClick={handleVerify} disabled={isLoading} className="w-full btn-primary py-3">
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted-background rounded-lg p-4">
                <h3 className="font-semibold mb-2">Supported Wallets</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ MetaMask (Desktop)</li>
                  <li>✓ WalletConnect (Mobile)</li>
                  <li>✓ Trust Wallet</li>
                  <li>✓ Coinbase Wallet</li>
                  <li>✓ 100+ other wallets</li>
                </ul>
              </div>

              <button onClick={() => open()} disabled={isLoading} className="w-full btn-primary py-3">
                Connect Wallet
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
