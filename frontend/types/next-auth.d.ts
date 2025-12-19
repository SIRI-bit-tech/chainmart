import { type JWT } from "@auth/core/jwt"
import type { UserProfile } from "./global"

declare module "next-auth" {
  interface Session {
    backendToken?: string
    user?: UserProfile
    partialBackendAuth?: boolean
    backendAuthError?: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    backendToken?: string
    refresh?: string
    user?: UserProfile
    partialBackendAuth?: boolean
    backendAuthError?: string
  }
}

