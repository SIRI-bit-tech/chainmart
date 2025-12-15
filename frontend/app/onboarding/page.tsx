"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CheckCircle2, Loader2, ShieldCheck, WalletMinimal } from "lucide-react"
import { useWeb3 } from "@/hooks/useWeb3"
import { web3Service } from "@/lib/web3"
import type { KycStatus, UserProfile } from "@/types/global"

type StepKey = "wallet" | "kyc" | "profile"

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
const steps: StepKey[] = ["wallet", "kyc", "profile"]

function normalizeUser(payload: any): UserProfile {
  return {
    id: String(payload.id),
    username: payload.username,
    email: payload.email,
    walletAddress: payload.wallet_address || "",
    displayName: payload.display_name || payload.username,
    avatar: payload.avatar,
    bio: payload.bio,
    role: payload.role,
    verified: Boolean(payload.wallet_verified),
    emailVerified: payload.email_verified,
    walletVerified: payload.wallet_verified,
    profileCompleted: payload.profile_completed,
    kycStatus: (payload.kyc_status as KycStatus) || "unsubmitted",
    reputation: payload.reputation,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  }
}

const stepMeta: Record<StepKey, { title: string; description: string; icon: React.ReactNode }> = {
  wallet: { title: "Connect wallet", description: "Sign a message to link your wallet", icon: <WalletMinimal className="w-5 h-5" /> },
  kyc: { title: "Verify identity", description: "Submit quick KYC details", icon: <ShieldCheck className="w-5 h-5" /> },
  profile: { title: "Complete profile", description: "Add a display name and bio", icon: <CheckCircle2 className="w-5 h-5" /> },
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { account, isConnected, connect } = useWeb3()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [kycForm, setKycForm] = useState({ full_name: "", country: "", document_type: "passport", document_number: "" })
  const [profileForm, setProfileForm] = useState({ display_name: "", bio: "" })
  const [isBusy, setIsBusy] = useState<StepKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  const token = useMemo(() => {
    if (typeof window === "undefined") return null
    const localToken = localStorage.getItem("auth_token")
    if (!localToken && session?.backendToken) {
      localStorage.setItem("auth_token", session.backendToken)
      return session.backendToken
    }
    return localToken || session?.backendToken || null
  }, [session?.backendToken])

  const fetchProfile = async () => {
    if (!token || !apiBase) return
    try {
      const response = await fetch(`${apiBase}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to load profile")
      const payload = await response.json()
      const normalized = normalizeUser(payload)
      setUser(normalized)
      setProfileForm({
        display_name: normalized.displayName || "",
        bio: normalized.bio || "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load profile")
    }
  }

  useEffect(() => {
    if (!token) return
    void fetchProfile()
  }, [token])

  useEffect(() => {
    if (token) return
    const stored = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!session && !stored) {
      router.replace("/login")
    }
  }, [router, session, token])

  useEffect(() => {
    if (user?.profileCompleted) {
      router.replace("/products")
    }
  }, [user?.profileCompleted, router])

  const stepDone = {
    wallet: Boolean(user?.walletVerified),
    kyc: (user?.kycStatus || "unsubmitted") === "verified",
    profile: Boolean(user?.profileCompleted),
  }

  const handleWalletVerify = async () => {
    if (!token || !account || !apiBase) {
      setError("Missing wallet or session. Please try again.")
      return
    }

    try {
      setIsBusy("wallet")
      setError(null)

      const nonceResponse = await fetch(`${apiBase}/auth/request-nonce/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: account }),
      })
      const { nonce, message } = await nonceResponse.json()

      const signature = await web3Service.signMessage(message)

      const verifyResponse = await fetch(`${apiBase}/users/verify_wallet/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wallet_address: account, message, signature, nonce }),
      })

      if (!verifyResponse.ok) throw new Error("Wallet verification failed")
      const updated = await verifyResponse.json()
      setUser(normalizeUser(updated))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet verification failed")
    } finally {
      setIsBusy(null)
    }
  }

  const handleKycSubmit = async () => {
    if (!token || !apiBase) {
      setError("Please sign in again.")
      return
    }
    try {
      setIsBusy("kyc")
      setError(null)
      const response = await fetch(`${apiBase}/users/kyc/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycForm),
      })
      if (!response.ok) throw new Error("KYC submission failed")
      const payload = await response.json()
      setUser((prev) => (prev ? { ...prev, kycStatus: payload.status } : prev))
      await fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "KYC submission failed")
    } finally {
      setIsBusy(null)
    }
  }

  const handleProfileComplete = async () => {
    if (!token || !apiBase) return
    try {
      setIsBusy("profile")
      setError(null)
      const response = await fetch(`${apiBase}/users/complete_profile/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      })
      if (!response.ok) throw new Error("Profile update failed")
      const updated = await response.json()
      setUser(normalizeUser(updated))
      router.replace("/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed")
    } finally {
      setIsBusy(null)
    }
  }

  const renderAction = (step: StepKey) => {
    if (step === "wallet") {
      return stepDone.wallet ? (
        <p className="text-sm text-success">Wallet linked</p>
      ) : (
        <div className="flex flex-col gap-3">
          <button onClick={() => connect()} className="btn-secondary py-2">Connect wallet</button>
          {isConnected && (
            <button onClick={handleWalletVerify} className="btn-primary py-2" disabled={isBusy === "wallet"}>
              {isBusy === "wallet" ? "Verifying..." : "Sign & verify"}
            </button>
          )}
        </div>
      )
    }

    if (step === "kyc") {
      return stepDone.kyc ? (
        <p className="text-sm text-success">KYC verified</p>
      ) : (
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Full name"
            value={kycForm.full_name}
            onChange={(e) => setKycForm((prev) => ({ ...prev, full_name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Country (2-letter code)"
            value={kycForm.country}
            onChange={(e) => setKycForm((prev) => ({ ...prev, country: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Document type"
            value={kycForm.document_type}
            onChange={(e) => setKycForm((prev) => ({ ...prev, document_type: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Document number"
            value={kycForm.document_number}
            onChange={(e) => setKycForm((prev) => ({ ...prev, document_number: e.target.value }))}
          />
          <button onClick={handleKycSubmit} className="btn-primary w-full py-2" disabled={isBusy === "kyc"}>
            {isBusy === "kyc" ? "Submitting..." : "Submit verification"}
          </button>
        </div>
      )
    }

    return stepDone.profile ? (
      <p className="text-sm text-success">Profile completed</p>
    ) : (
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Display name"
          value={profileForm.display_name}
          onChange={(e) => setProfileForm((prev) => ({ ...prev, display_name: e.target.value }))}
        />
        <textarea
          className="input min-h-24"
          placeholder="Short bio"
          value={profileForm.bio}
          onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
        />
        <button onClick={handleProfileComplete} className="btn-primary w-full py-2" disabled={isBusy === "profile"}>
          {isBusy === "profile" ? "Saving..." : "Save and continue"}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/5 to-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Step-by-step onboarding</p>
          <h1 className="text-3xl font-bold">Finish setting up your ChainMart account</h1>
          <p className="text-muted-foreground text-sm">Connect your wallet, verify identity, and complete your profile before shopping.</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-3 text-sm text-error text-center">{error}</div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const meta = stepMeta[step]
            const done = stepDone[step]
            const active = !done && steps.slice(0, steps.indexOf(step)).every((key) => stepDone[key])
            return (
              <div key={step} className={`card p-5 space-y-3 ${done ? "border-success" : ""}`}>
                <div className="flex items-center gap-2">
                  {meta.icon}
                  <div>
                    <p className="font-semibold">{meta.title}</p>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                  {done && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
                  {isBusy === step && <Loader2 className="w-4 h-4 text-muted-foreground ml-auto animate-spin" />}
                </div>
                {!done && !active ? (
                  <p className="text-xs text-muted-foreground">Complete previous steps first.</p>
                ) : (
                  renderAction(step)
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

