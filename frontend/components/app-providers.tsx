"use client"

import { type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { Web3Provider } from "./web3-provider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Web3Provider>{children}</Web3Provider>
    </SessionProvider>
  )
}

