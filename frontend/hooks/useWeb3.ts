"use client"

import { useEffect, useState } from "react"
import { useAccount, useWalletClient, useDisconnect } from "wagmi"
import { web3Service } from "@/lib/web3"

export function useWeb3() {
  const { address, isConnected, connector } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  
  const [balance, setBalance] = useState<string>("0")
  const [chainId, setChainId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Web3 service when wallet connects
  useEffect(() => {
    const initWeb3 = async () => {
      if (!isConnected || !address) {
        web3Service.disconnect()
        setBalance("0")
        setChainId(null)
        return
      }

      try {
        // Set account in web3Service
        web3Service.setAccount(address)

        // Initialize provider from wallet client
        if (walletClient) {
          await web3Service.initFromWalletClient(walletClient)
        }

        // Get balance
        const bal = await web3Service.getBalance(address)
        setBalance(bal)

        // Get chain ID
        const chain = await web3Service.getChainId()
        setChainId(chain)
      } catch (err) {
        console.error("Web3 initialization failed:", err)
        setError(err instanceof Error ? err.message : "Initialization failed")
      }
    }

    initWeb3()
  }, [isConnected, address, walletClient])

  const connect = async () => {
    // Connection is handled by WalletModal component
    // This function is kept for compatibility
    setError("Please use the Connect Wallet button")
  }

  const disconnect = () => {
    wagmiDisconnect()
    web3Service.disconnect()
    setBalance("0")
    setChainId(null)
  }

  return {
    account: address || null,
    isConnected,
    balance,
    chainId,
    isLoading,
    error,
    connect,
    disconnect,
    connector,
  }
}
