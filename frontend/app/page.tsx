import Link from "next/link"
import { PRODUCT_CATEGORIES } from "@/config/constants"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-accent">
            ChainMart
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/browse" className="text-foreground hover:text-accent transition-colors">
              Marketplace
            </Link>
            <Link href="/auth/connect-wallet" className="btn-primary">
              Connect Wallet
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-accent/5 to-background">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 text-foreground">
                Decentralized Marketplace
                <br />
                <span className="text-accent">Powered by Blockchain</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Buy and sell with confidence using smart contract escrow. Polygon blockchain ensures secure, transparent
                transactions with minimal fees.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/browse" className="btn-primary px-8 py-3 text-lg">
                  Browse Products
                </Link>
                <Link href="/auth/register" className="btn-secondary px-8 py-3 text-lg">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Why ChainMart?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-3">Smart Contract Escrow</h3>
                <p className="text-muted-foreground">
                  Funds held securely in smart contracts until both parties are satisfied
                </p>
              </div>
              <div className="card p-6">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-3">Low Fees</h3>
                <p className="text-muted-foreground">
                  Polygon network ensures minimal transaction costs compared to traditional marketplaces
                </p>
              </div>
              <div className="card p-6">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-3">Global Access</h3>
                <p className="text-muted-foreground">Trade with anyone worldwide using cryptocurrency payments</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-muted-background">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {PRODUCT_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/browse?category=${category.id}`}
                  className="card p-6 hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold">{category.label}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-accent text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to trade on Web3?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of buyers and sellers on the most secure decentralized marketplace
            </p>
            <Link
              href="/auth/connect-wallet"
              className="btn bg-white text-accent hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Start Trading Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
