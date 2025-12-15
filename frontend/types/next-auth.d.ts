import { type JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    backendToken?: string
    user?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string
    refresh?: string
    user?: any
  }
}

