import { createConfig, http } from "wagmi"
import { polygon, polygonAmoy } from "wagmi/chains"
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors"

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID"

// Define chains
const chains = [polygonAmoy, polygon] as const

// Create wagmi config with multiple wallet options
export const wagmiConfig = createConfig({
  chains,
  connectors: [
    // Injected wallets (MetaMask, Brave, etc.)
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect - supports 100+ wallets
    walletConnect({
      projectId,
      metadata: {
        name: "ChainMart",
        description: "Decentralized Web3 Marketplace on Polygon",
        url: typeof window !== "undefined" ? window.location.origin : "https://chainmart.com",
        icons: [typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "https://chainmart.com/logo.png"],
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: "dark",
        themeVariables: {
          "--wcm-z-index": "9999",
        },
      },
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: "ChainMart",
      appLogoUrl: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : undefined,
    }),
  ],
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
})
