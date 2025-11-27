import Link from "next/link"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy - ChainMart",
  description: "Read ChainMart privacy policy and data protection information.",
}

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-6 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground">
                ChainMart (&ldquo;we&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We collect information in the following ways:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Information you voluntarily provide (name, email, address)</li>
                <li>Wallet addresses from MetaMask connection</li>
                <li>Transaction data on the blockchain</li>
                <li>Usage data through cookies and analytics</li>
                <li>Device information and IP address</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the information we collect for:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Processing transactions and sending related information</li>
                <li>Providing customer support and improving services</li>
                <li>Detecting and preventing fraud</li>
                <li>Compliance with legal obligations</li>
                <li>Marketing communications (with your consent)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the Internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Blockchain Data</h2>
              <p className="text-muted-foreground">
                Information recorded on the blockchain is permanent and cannot be deleted. Your wallet address and
                transaction history are publicly visible on the Polygon blockchain.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We may use third-party services for analytics, payment processing, and customer support. These services
                have their own privacy policies, and we encourage you to review them.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies to enhance your experience. You can control cookie settings through your browser
                preferences.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at privacy@chainmart.io
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
