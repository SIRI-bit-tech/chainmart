import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Web3Provider } from "@/components/web3-provider"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChainMart - Web3 Marketplace",
  description: "Decentralized marketplace with smart contract escrow and secure payments",
  keywords: ["Web3", "Marketplace", "Blockchain", "Polygon", "DeFi"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chainmart.io",
    siteName: "ChainMart",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F172A",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${geistMono.className} bg-background text-foreground`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  )
}
