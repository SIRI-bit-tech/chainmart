"use client"

import { type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { Web3Provider } from "./web3-provider"
import { PartialAuthWarning } from "./auth/PartialAuthWarning"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Web3Provider>
        <PartialAuthWarning />
        {children}
      </Web3Provider>
    </SessionProvider>
  )
}

