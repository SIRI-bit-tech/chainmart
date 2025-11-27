import Link from "next/link"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service - ChainMart",
  description: "Read ChainMart terms of service and user agreement.",
}

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-6 text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using ChainMart, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on
                ChainMart for personal, non-commercial transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the site</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
              <p className="text-muted-foreground">
                Users must provide accurate information when creating an account. You are responsible for maintaining
                the confidentiality of your wallet private keys and login credentials. ChainMart is not responsible for
                any unauthorized access to your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Buyer Protection</h2>
              <p className="text-muted-foreground">
                ChainMart uses smart contract escrow to protect buyers. Funds are held until order confirmation.
                Disputes may be resolved through our dispute resolution process.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Seller Responsibilities</h2>
              <p className="text-muted-foreground mb-4">Sellers agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate product descriptions</li>
                <li>Deliver products in the condition advertised</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not list prohibited items</li>
                <li>Process orders promptly</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Prohibited Items</h2>
              <p className="text-muted-foreground">
                ChainMart prohibits the sale of illegal items, counterfeit goods, weapons, drugs, and other items that
                violate local laws or our policies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Blockchain Transactions</h2>
              <p className="text-muted-foreground">
                All transactions are irreversible once confirmed on the blockchain. Users must verify transactions
                before confirmation. ChainMart cannot reverse blockchain transactions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                The materials on ChainMart are provided on an &apos;as is&apos; basis. ChainMart makes no warranties,
                expressed or implied, and hereby disclaims and negates all other warranties including, without
                limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall ChainMart or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use the materials on the site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Revisions</h2>
              <p className="text-muted-foreground">
                ChainMart may revise these terms of service at any time without notice. By using this site, you are
                agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
