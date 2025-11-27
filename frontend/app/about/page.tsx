import Link from "next/link"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "About ChainMart - Decentralized Web3 Marketplace",
  description:
    "Learn about ChainMart, a decentralized marketplace powered by blockchain technology and smart contracts on Polygon.",
}

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground">
            ChainMart
          </Link>
          <div className="space-x-4">
            <Link href="/browse" className="text-muted-foreground hover:text-foreground">
              Browse
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 container py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-6 text-foreground">About ChainMart</h1>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              ChainMart is revolutionizing e-commerce by bringing decentralization, transparency, and security to online
              marketplaces. We combine the power of blockchain technology with user-friendly marketplace features to
              create a trustless, commission-efficient platform where buyers and sellers interact directly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Why ChainMart?</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Smart Contract Security</h3>
                <p className="text-muted-foreground">
                  All transactions are protected by audited smart contracts on the Polygon blockchain, ensuring buyer
                  and seller protection through escrow mechanisms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Lower Fees</h3>
                <p className="text-muted-foreground">
                  By eliminating intermediaries, ChainMart offers 3.5% platform fees compared to traditional
                  marketplaces charging 10-20%.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Multi-Vendor Support</h3>
                <p className="text-muted-foreground">
                  Any user can be both a buyer and seller, with flexible seller profiles, inventory management, and
                  real-time order tracking.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Wallet Integration</h3>
                <p className="text-muted-foreground">
                  Connect your MetaMask wallet for instant Web3 authentication and secure blockchain transactions.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Technology Stack</h2>
            <p className="text-muted-foreground mb-4">ChainMart is built with modern web technologies:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Solidity Smart Contracts on Polygon</li>
              <li>Next.js 15 Frontend with TypeScript</li>
              <li>Django REST API Backend</li>
              <li>PostgreSQL Database</li>
              <li>Web3.js for Blockchain Integration</li>
              <li>Real-time WebSocket Support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Get Started</h2>
            <p className="text-muted-foreground mb-4">Ready to buy or sell? Start your ChainMart journey today.</p>
            <div className="space-x-4">
              <Link
                href="/auth/connect-wallet"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Connect Wallet
              </Link>
              <Link
                href="/browse"
                className="inline-block px-6 py-2 border border-border text-foreground rounded-lg hover:bg-accent"
              >
                Browse Products
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
