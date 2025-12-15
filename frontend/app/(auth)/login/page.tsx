"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { SocialButtons } from "@/components/auth/social-buttons"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.ok) {
        router.push("/onboarding")
      } else {
        setError(result?.error || "Login failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>

          <SocialButtons redirectTo="/onboarding" />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or continue with email</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-4">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full btn-primary py-3">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-accent hover:underline">
                Create one
              </Link>
            </p>
            <p className="text-muted-foreground text-sm">Wallet connection happens after sign-in.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
