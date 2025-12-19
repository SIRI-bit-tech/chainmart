import type { UserProfile } from "@/types/global"

type KycStatus = "unsubmitted" | "pending" | "verified" | "rejected"

/**
 * Safely converts date strings to Date objects
 */
function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date()
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? new Date() : date
}

/**
 * Normalizes API user payload to UserProfile type with proper date conversion
 */
export function normalizeUserProfile(payload: any): UserProfile {
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
    createdAt: parseDate(payload.created_at),
    updatedAt: parseDate(payload.updated_at),
  }
}