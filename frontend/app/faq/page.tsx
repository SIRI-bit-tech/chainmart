"use client"

import { useState } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const faqs = [
    {
      id: "what-is-chainmart",
      question: "What is ChainMart?",
      answer:
        "ChainMart is a decentralized marketplace built on the Polygon blockchain. It allows users to buy and sell products directly with each other using smart contracts for secure transactions and escrow protection.",
    },
    {
      id: "how-to-start",
      question: "How do I start using ChainMart?",
      answer:
        "Simply connect your MetaMask wallet or create an account with your email. Browse products, add items to your cart, and checkout using cryptocurrency on the Polygon network.",
    },
    {
      id: "become-seller",
      question: "How can I become a seller?",
      answer:
        'Any buyer can become a seller. Just navigate to the "Sell" page, set up your store profile, and start listing products. You can manage both buyer and seller activities from the same account.',
    },
    {
      id: "fees",
      question: "How much does ChainMart charge?",
      answer:
        "ChainMart charges a 3.5% platform fee on each transaction. This is significantly lower than traditional marketplaces which typically charge 10-20%. Gas fees for blockchain transactions are paid separately.",
    },
    {
      id: "blockchain-network",
      question: "Which blockchain does ChainMart use?",
      answer:
        "ChainMart operates on the Polygon network, which is fast, secure, and has significantly lower transaction costs compared to Ethereum mainnet.",
    },
    {
      id: "buyer-protection",
      question: "Is my purchase protected?",
      answer:
        "Yes! All purchases are protected by smart contract escrow. Funds are held until you confirm receipt of the order. If there are issues, our dispute resolution system can help.",
    },
    {
      id: "wallet-required",
      question: "Do I need a crypto wallet?",
      answer:
        "You can use MetaMask for direct blockchain transactions, or register with email for a managed account. Both methods are supported for maximum flexibility.",
    },
    {
      id: "return-policy",
      question: "What is the return policy?",
      answer:
        "Return policies are set by individual sellers. Check the product listing for specific seller policies. Disputes can be resolved through our support system.",
    },
    {
      id: "payment-methods",
      question: "What payment methods are accepted?",
      answer:
        "ChainMart accepts MATIC, USDC, USDT, and ETH on the Polygon network. All transactions are processed through blockchain smart contracts.",
    },
    {
      id: "transaction-fees",
      question: "How much do gas fees cost?",
      answer:
        "Gas fees on Polygon are typically very low (under $1 for most transactions). Exact costs depend on network congestion at the time of transaction.",
    },
  ]

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
            <Link href="/profile" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-12">
            Find answers to common questions about ChainMart, transactions, selling, and more.
          </p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-border rounded-lg">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left font-semibold text-foreground hover:bg-accent transition-colors flex items-center justify-between"
                >
                  {faq.question}
                  <span className="text-muted-foreground">{expandedId === faq.id ? "−" : "+"}</span>
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 py-4 border-t border-border bg-background/50">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-accent rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-foreground">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find the answer you&apos;re looking for? Please reach out to our support team.
            </p>
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
