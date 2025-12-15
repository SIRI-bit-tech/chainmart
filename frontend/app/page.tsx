"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { PRODUCT_CATEGORIES } from "@/config/constants"
import { Footer } from "@/components/footer"
import { Lock, Zap, Globe } from "lucide-react"
import { BlockchainNetworkAnimation } from "@/components/blockchain-network-animation"
import { TestimonialCarousel, type Testimonial } from "@/components/testimonial-carousel"

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "NFT Collector",
    company: "CryptoArt Gallery",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "ChainMart revolutionized how I buy and sell digital art. The smart contract escrow gives me complete peace of mind, and the low fees mean more profit for creators.",
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "E-commerce Entrepreneur",
    company: "TechGear Pro",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "As a seller, I love the transparency and security. No chargebacks, instant settlements, and a global customer base. ChainMart is the future of online commerce.",
    verified: true,
  },
  {
    id: 3,
    name: "Aisha Patel",
    role: "Blockchain Developer",
    company: "Web3 Solutions",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    text: "The platform's architecture is impressive. Built on Polygon for speed and low costs, with robust smart contracts. It's everything a Web3 marketplace should be.",
    verified: true,
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Digital Nomad",
    company: "Remote Ventures",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 5,
    text: "I've been using ChainMart for 6 months now. The dispute resolution is fair, transactions are lightning-fast, and I've never had a single issue. Highly recommended!",
    verified: true,
  },
  {
    id: 5,
    name: "Elena Volkov",
    role: "Crypto Enthusiast",
    company: "DeFi Traders",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
    rating: 5,
    text: "Finally, a marketplace that understands crypto users. No KYC hassles, true peer-to-peer trading, and the reputation system ensures quality. This is how e-commerce should work.",
    verified: true,
  },
]

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP staggered entrance animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5 }
      )
        .fromTo(
          descriptionRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          buttonsRef.current?.children || [],
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.2 },
          "-=0.4"
        )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Blockchain Network Animation Background */}
      <BlockchainNetworkAnimation />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-border" style={{ background: "rgba(15, 23, 42, 0.8)" }}>
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold gradient-text-purple">
            ChainMart
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 ref={headlineRef} className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Decentralized Marketplace
                <br />
                <span className="gradient-text">Powered by Blockchain</span>
              </h1>
              <p ref={descriptionRef} className="text-xl text-body mb-10 max-w-2xl mx-auto">
                Buy and sell with confidence using smart contract escrow. Polygon blockchain ensures secure, transparent
                transactions with minimal fees.
              </p>
              <div ref={buttonsRef} className="flex gap-4 justify-center flex-wrap">
                <Link href="/register" className="btn-primary px-10 py-4 text-lg">
                  Create Account
                </Link>
                <Link href="/login" className="btn-secondary px-10 py-4 text-lg">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 relative">
          <div className="container relative z-10">
            <h2 className="text-4xl font-bold text-center mb-16 gradient-text-purple">Why ChainMart?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-8 hover:scale-105 transition-transform duration-300">
                <div className="mb-6 inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <Lock className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Smart Contract Escrow</h3>
                <p className="text-body leading-relaxed">
                  Funds held securely in smart contracts until both parties are satisfied
                </p>
              </div>
              <div className="card p-8 hover:scale-105 transition-transform duration-300">
                <div className="mb-6 inline-block p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <Zap className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Low Fees</h3>
                <p className="text-body leading-relaxed">
                  Polygon network ensures minimal transaction costs compared to traditional marketplaces
                </p>
              </div>
              <div className="card p-8 hover:scale-105 transition-transform duration-300">
                <div className="mb-6 inline-block p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Globe className="w-12 h-12 text-pink-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Global Access</h3>
                <p className="text-body leading-relaxed">Trade with anyone worldwide using cryptocurrency payments</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative">
          <div className="container relative z-10">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text mb-2">$2.5M+</div>
                <p className="text-body">Total Volume</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text-cyan mb-2">15K+</div>
                <p className="text-body">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text-purple mb-2">50K+</div>
                <p className="text-body">Transactions</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text mb-2">0.1%</div>
                <p className="text-body">Platform Fee</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 relative">
          <div className="container relative z-10">
            <h2 className="text-4xl font-bold text-center mb-4 text-white">Shop Categories</h2>
            <p className="text-center text-body mb-16 max-w-2xl mx-auto">
              Discover a wide range of products across multiple categories, all secured by blockchain technology
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              {PRODUCT_CATEGORIES.map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`} className="card p-6 hover:scale-105 transition-all duration-300 text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-semibold text-white">{category.label}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 relative">
          <div className="container relative z-10">
            <h2 className="text-4xl font-bold text-center mb-4 gradient-text-purple">How It Works</h2>
            <p className="text-center text-body mb-16 max-w-2xl mx-auto">
              Simple, secure, and transparent trading in just a few steps
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Sign Up</h3>
                <p className="text-body">Create your account with email or social login.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Connect Wallet</h3>
                <p className="text-body">Link your wallet after signup to enable Web3 checkout.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Verify & Shop</h3>
                <p className="text-body">Complete KYC, finish your profile, and start shopping securely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 relative">
          <div className="container relative z-10">
            <h2 className="text-4xl font-bold text-center mb-4 text-white">What Our Users Say</h2>
            <p className="text-center text-body mb-16 max-w-2xl mx-auto">
              Join thousands of satisfied buyers and sellers on ChainMart
            </p>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="container text-center relative z-10">
            <h2 className="text-5xl font-bold mb-6 gradient-text">Ready to get started?</h2>
            <p className="text-xl text-body mb-10 max-w-2xl mx-auto">
              Create your account, connect your wallet during onboarding, and shop securely.
            </p>
            <Link href="/register" className="btn-primary px-12 py-5 text-xl font-semibold inline-block glow-purple">
              Create Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
