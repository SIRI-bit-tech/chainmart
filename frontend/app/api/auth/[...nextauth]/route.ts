import NextAuth from "next-auth"
import AppleProvider from "next-auth/providers/apple"
import AzureADProvider from "next-auth/providers/azure-ad"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile && profile.email) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
        if (!apiBase) {
          return token
        }
        try {
          const response = await fetch(`${apiBase}/auth/social-login/`, {
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

          if (response.ok) {
            const data = await response.json()
            token.backendToken = data.token
            token.refresh = data.refresh
            token.user = data.user
          }
        } catch (err) {
          console.error("Social login handshake failed", err)
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        backendToken: token.backendToken as string | undefined,
        user: (token.user as any) || session.user,
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

