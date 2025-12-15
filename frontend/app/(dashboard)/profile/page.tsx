"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "@/hooks/useWeb3"
import { formatAddress } from "@/lib/utils"
import type { UserProfile } from "@/types/global"

export default function ProfilePage() {
  const { account, isConnected, balance } = useWeb3()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!account) return
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!apiBase || !token) return

      try {
        setIsLoading(true)
        const response = await fetch(`${apiBase}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch profile")

        const data = await response.json()
        setProfile(data)
        setFormData({
          displayName: data.display_name || "",
          bio: data.bio || "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isConnected, account])

  const handleSave = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!apiBase || !token) throw new Error("Missing session")

      const response = await fetch(`${apiBase}/users/complete_profile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updated = await response.json()
        setProfile(updated)
        setIsEditing(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    }
  }

  if (isLoading) {
    return <div className="card p-8 h-96 shimmer" />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6">Account Information</h2>

          {profile && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                <p className="font-mono text-sm bg-muted-background p-3 rounded">
                  {formatAddress(profile.walletAddress, 12)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Username</p>
                <p className="font-medium">{profile.username}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Reputation Score</p>
                <p className="text-lg font-bold text-accent">{profile.reputation?.score || 0}</p>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Balance */}
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6">Wallet Balance</h2>

          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
            <p className="text-4xl font-bold text-accent mb-2">{Number.parseFloat(balance).toFixed(4)} MATIC</p>
            <p className="text-xs text-muted-foreground">Connected: {formatAddress(account || "", 12)}</p>
          </div>

          <button className="w-full btn-primary py-3">Withdraw Funds</button>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-secondary py-2 px-4">
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="input min-h-24"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} className="btn-primary py-2 px-6">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary py-2 px-6">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Display Name</p>
              <p className="font-medium">{profile?.displayName || "Not set"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Bio</p>
              <p className="text-muted-foreground">{profile?.bio || "No bio added yet"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
