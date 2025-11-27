"use client"

import { useEffect, useState } from "react"
import { web3Service } from "@/lib/web3"

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState<string>("0")
  const [chainId, setChainId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Web3 on mount
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        await web3Service.init()
        const currentAccount = await web3Service.getAccount()

        if (currentAccount) {
          setAccount(currentAccount)
          setIsConnected(true)

          const bal = await web3Service.getBalance(currentAccount)
          setBalance(bal)

          const chain = await web3Service.getChainId()
          setChainId(chain)
        }
      } catch (err) {
        console.error("Web3 initialization failed:", err)
      }
    }

    initWeb3()

    // Listen for account changes
    window.addEventListener("accountsChanged", initWeb3)
    return () => window.removeEventListener("accountsChanged", initWeb3)
  }, [])

  const connect = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const connectedAccount = await web3Service.connectWallet()
      if (connectedAccount) {
        setAccount(connectedAccount)
        setIsConnected(true)

        const bal = await web3Service.getBalance(connectedAccount)
        setBalance(bal)

        const chain = await web3Service.getChainId()
        setChainId(chain)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect"
      setError(errorMessage)
      console.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    web3Service.disconnect()
    setAccount(null)
    setIsConnected(false)
    setBalance("0")
  }

  return {
    account,
    isConnected,
    balance,
    chainId,
    isLoading,
    error,
    connect,
    disconnect,
  }
}
