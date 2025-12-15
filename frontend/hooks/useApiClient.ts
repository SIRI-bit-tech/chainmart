import { useSession } from "next-auth/react"
import { useMemo } from "react"

interface ApiClient {
  apiBase: string | null
  token: string | null
  isReady: boolean
  headers: Record<string, string>
}

interface ApiError extends Error {
  status?: number
  statusText?: string
}

/**
 * Centralized API client hook that provides secure access to API configuration
 * and authentication tokens via NextAuth session (httpOnly cookies).
 * 
 * This replaces scattered localStorage usage and duplicated API config logic.
 * Also handles partial authentication states where NextAuth succeeded but backend handshake failed.
 */
export function useApiClient(): ApiClient {
  const { data: session } = useSession()

  return useMemo(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || null
    const token = session?.backendToken || null
    const isReady = Boolean(apiBase && token && !session?.partialBackendAuth)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return {
      apiBase,
      token,
      isReady,
      headers,
    }
  }, [session?.backendToken, session?.partialBackendAuth])
}

/**
 * Enhanced API client hook with built-in fetch wrapper for common operations.
 * Provides consistent error handling and automatic header management.
 * Handles partial authentication states with clear error messages.
 */
export function useApiRequest() {
  const apiClient = useApiClient()
  const { data: session } = useSession()

  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // Check for partial authentication state
    if (session?.partialBackendAuth) {
      throw new Error(`Authentication incomplete: ${session.backendAuthError || 'Backend handshake failed'}`)
    }

    if (!apiClient.isReady) {
      throw new Error("API client not ready - missing configuration or session")
    }

    const url = `${apiClient.apiBase}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiClient.headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = new Error(`API request failed: ${response.statusText}`) as ApiError
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }

    return response
  }

  const get = async (endpoint: string): Promise<any> => {
    const response = await request(endpoint, { method: "GET" })
    return response.json()
  }

  const post = async (endpoint: string, data?: any): Promise<any> => {
    const response = await request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }

  const put = async (endpoint: string, data?: any): Promise<any> => {
    const response = await request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
    return response.json()
  }

  const del = async (endpoint: string): Promise<any> => {
    const response = await request(endpoint, { method: "DELETE" })
    return response.json()
  }

  return {
    ...apiClient,
    request,
    get,
    post,
    put,
    delete: del,
  }
}