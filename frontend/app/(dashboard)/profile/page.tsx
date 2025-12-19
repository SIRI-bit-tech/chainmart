"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "@/hooks/useWeb3"
import { useApiRequest } from "@/hooks/useApiClient"
import { formatAddress } from "@/lib/utils"
import { normalizeUserProfile } from "@/lib/user-utils"
import type { UserProfile } from "@/types/global"

export default function ProfilePage() {
  const { account, isConnected, balance } = useWeb3()
  const apiClient = useApiRequest()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      // Check preconditions before setting loading state
      if (!account) {
        setIsLoading(false)
        return
      }
      
      if (!apiClient.isReady) {
        setIsLoading(false)
        setError("Missing API configuration or session")
        return
      }

      try {
        setIsLoading(true)
        const data = await apiClient.get("/users/me/")
        const normalizedProfile = normalizeUserProfile(data)
        setProfile(normalizedProfile)
        setFormData({
          displayName: normalizedProfile.displayName || "",
          bio: normalizedProfile.bio || "",
        })
        setError(null) // Clear any previous errors
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isConnected, account, apiClient.isReady])

  const handleSave = async () => {
    if (!apiClient.isReady) {
      setError("Missing API configuration or session")
      return
    }

    try {
      setIsSaving(true)
      setError(null) // Clear any previous errors
      
      const updated = await apiClient.post("/users/complete_profile/", formData)
      setProfile(normalizeUserProfile(updated))
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
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

            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-4">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={handleSave} disabled={isSaving} className="btn-primary py-2 px-6">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={isSaving} className="btn-secondary py-2 px-6">
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
