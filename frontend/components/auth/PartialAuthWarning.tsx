"use client"

import { useSession, signOut } from "next-auth/react"
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react"
import { useState } from "react"

/**
 * Component to handle partial authentication states where NextAuth succeeded
 * but the backend handshake failed. Provides clear messaging and recovery options.
 */
export function PartialAuthWarning() {
  const { data: session } = useSession()
  const [isRetrying, setIsRetrying] = useState(false)

  // Only show if we have a partial authentication state
  if (!session?.partialBackendAuth) {
    return null
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      // Force a session refresh by signing out and back in
      await signOut({ redirect: false })
      // The user will need to sign in again, which will retry the backend handshake
      window.location.href = "/login"
    } catch (error) {
      console.error("Failed to retry authentication:", error)
      setIsRetrying(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-error/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-error-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-error-foreground">
                Authentication Incomplete
              </p>
              <p className="text-xs text-error-foreground/80">
                {session.backendAuthError || "Backend authentication failed. Some features may not work."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-error-foreground text-error rounded hover:bg-error-foreground/90 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? "Retrying..." : "Retry"}
            </button>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border border-error-foreground/30 text-error-foreground rounded hover:bg-error-foreground/10"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to check if the current session has partial authentication issues
 */
export function usePartialAuthCheck() {
  const { data: session } = useSession()
  
  return {
    hasPartialAuth: Boolean(session?.partialBackendAuth),
    authError: session?.backendAuthError,
    isAuthenticated: Boolean(session && !session.partialBackendAuth),
  }
}