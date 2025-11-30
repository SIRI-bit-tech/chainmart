import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { polygon, polygonAmoy } from "@reown/appkit/networks"
import { QueryClient } from "@tanstack/react-query"

// WalletConnect Project ID - Get from https://cloud.reown.com/
// Fail fast if not configured to prevent silent failures in production
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId || projectId.trim() === "") {
  throw new Error(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. " +
    "Please set this environment variable in your .env.local file. " +
    "Get your Project ID from https://cloud.reown.com/"
  )
}

// Define chains
export const networks = [polygonAmoy, polygon] as const

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [polygonAmoy, polygon],
  projectId,
  ssr: true,
})

// Create query client
export const queryClient = new QueryClient()

// Create AppKit modal
export const modal = createAppKit({
  adapters: [wagmiAdapter] as any, // Type assertion to handle version mismatch
  networks: [polygonAmoy, polygon],
  projectId,
  metadata: {
    name: "ChainMart",
    description: "Decentralized Web3 Marketplace on Polygon",
    url: typeof window !== "undefined" ? window.location.origin : "https://chainmart.com",
    icons: [typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "https://chainmart.com/logo.png"],
  },
  features: {
    analytics: true,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-z-index": 9999,
  },
})

// Export wagmi config for compatibility
export const wagmiConfig = wagmiAdapter.wagmiConfig
