"use client"

import { useAppKit } from "@reown/appkit/react"
import { useAccount, useDisconnect } from "wagmi"
import { formatAddress } from "@/lib/utils"
import { Wallet } from "lucide-react"

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => open()}
          className="btn-secondary px-4 py-2 text-sm font-medium"
        >
          {formatAddress(address, 6)}
        </button>
        <button
          onClick={() => disconnect()}
          className="btn-secondary px-4 py-2 text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  )
}
