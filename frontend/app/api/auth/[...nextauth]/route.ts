import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import AzureAD from "next-auth/providers/azure-ad"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { UserProfile } from "@/types/global"

// Extended user type for credentials provider
interface ExtendedUser {
  id: string
  email: string
  name: string
  image?: string
  backendToken: string
  refresh: string
  user: UserProfile
}

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
          if (!apiBase) {
            console.error("NEXT_PUBLIC_API_URL not configured")
            return null
          }

          const response = await fetch(`${apiBase}/users/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.display_name || data.user.username,
              image: data.user.avatar,
              backendToken: data.token,
              refresh: data.refresh,
              user: data.user,
            }
          } else {
            console.error("Login failed:", await response.text())
            return null
          }
        } catch (error) {
          console.error("Login error:", error)
          return null
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Handle credentials provider (email/password login)
      if (account?.provider === "credentials" && user) {
        const extendedUser = user as ExtendedUser
        token.backendToken = extendedUser.backendToken
        token.refresh = extendedUser.refresh
        token.user = extendedUser.user
        return token
      }

      // Handle social providers (Google, Microsoft, Apple)
      if (account && profile && profile.email && account.provider !== "credentials") {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
        if (!apiBase) {
          // Mark as partial auth - missing API configuration
          token.partialBackendAuth = true
          token.backendAuthError = "API configuration missing"
          console.error("NextAuth: NEXT_PUBLIC_API_URL not configured for social login")
          return token
        }
        
        try {
          const response = await fetch(`${apiBase}/users/social-login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,
              email: profile.email,
              display_name: (profile as any).name || profile.email?.split("@")[0],
              avatar: (profile as any).picture,
              provider_user_id: account.providerAccountId,
            }),
          })

          if (!response.ok) {
            // Backend handshake failed - mark as partial auth
            const errorText = await response.text().catch(() => "Unknown error")
            token.partialBackendAuth = true
            token.backendAuthError = `Backend handshake failed: ${response.status} ${response.statusText}`
            console.error("NextAuth: Social login backend handshake failed:", {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              provider: account.provider,
              email: profile.email
            })
            return token
          }

          // Validate response JSON structure
          let data: any
          try {
            data = await response.json()
          } catch (parseError) {
            token.partialBackendAuth = true
            token.backendAuthError = "Invalid JSON response from backend"
            console.error("NextAuth: Failed to parse backend response:", parseError)
            return token
          }

          // Validate expected fields in response
          if (!data.token || !data.user) {
            token.partialBackendAuth = true
            token.backendAuthError = "Backend response missing required fields (token, user)"
            console.error("NextAuth: Backend response validation failed:", {
              hasToken: Boolean(data.token),
              hasUser: Boolean(data.user),
              response: data
            })
            return token
          }

          // Success - set backend authentication data
          token.backendToken = data.token
          token.refresh = data.refresh
          token.user = data.user
          token.partialBackendAuth = false
          token.backendAuthError = undefined
          
          console.log("NextAuth: Social login backend handshake successful:", {
            provider: account.provider,
            email: profile.email,
            hasToken: Boolean(data.token)
          })
          
        } catch (err) {
          // Network or other errors - mark as partial auth
          token.partialBackendAuth = true
          token.backendAuthError = `Network error during backend handshake: ${err instanceof Error ? err.message : 'Unknown error'}`
          console.error("NextAuth: Social login handshake network error:", {
            error: err,
            provider: account.provider,
            email: profile.email
          })
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        backendToken: token.backendToken as string | undefined,
        user: token.user || session.user,
        partialBackendAuth: token.partialBackendAuth as boolean | undefined,
        backendAuthError: token.backendAuthError as string | undefined,
      }
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

