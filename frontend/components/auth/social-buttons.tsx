"use client"

import { signIn } from "next-auth/react"

interface SocialButtonsProps {
  redirectTo?: string
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2H12z" />
    <path fill="#34A853" d="M6.6 14.3l-.9.7-2.4 1.8C4.9 20 8.2 22 12 22c2.4 0 4.4-.8 5.8-2.3l-3-2.3c-.8.6-1.8 1-2.8 1-2.2 0-4-1.5-4.6-3.6z" />
    <path fill="#4A90E2" d="M3.3 7.2C2.5 8.7 2 10.3 2 12c0 1.7.5 3.3 1.3 4.8l3.3-2.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.3 7.2z" />
    <path fill="#FBBC05" d="M12 5.5c1.3 0 2.4.4 3.2 1.2l2.4-2.4C16.4 2.9 14.4 2 12 2 8.2 2 4.9 4 3.3 7.2l3.3 2.5C7.9 7 9.8 5.5 12 5.5z" />
  </svg>
)

const MicrosoftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#F35325" d="M2 2h9.5v9.5H2z" />
    <path fill="#81BC06" d="M12.5 2H22v9.5h-9.5z" />
    <path fill="#05A6F0" d="M2 12.5h9.5V22H2z" />
    <path fill="#FFBA08" d="M12.5 12.5H22V22h-9.5z" />
  </svg>
)

const AppleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.7 2c-.9.1-2 .6-2.6 1.3-.6.6-1.1 1.6-.9 2.5 1 .1 2-.4 2.6-1.1.6-.7 1-1.7.9-2.7zM19.8 13.2c0-2.2 1.8-3.2 1.8-3.2-1 .1-2 .6-2.5 1.3-.5.6-.9 1.6-.8 2.5 0 .2.1.4.1.6-.4.1-.8.2-1.1.2-1 0-1.4-.7-2.5-.7s-1.6.7-2.5.7c-.8 0-1.6-.7-2.1-1.5-.8-1.3-.7-3.7.6-5 .5-.6 1.3-.9 2-.9.8 0 1.5.5 2.5.5s1.7-.5 2.5-.5c.7 0 1.4.3 1.9.8-.8.4-1.2 1.3-1.2 2.2 0 1.3.7 2.4 1.8 2.9-.2.5-.5 1-.9 1.4-.5.6-1 .9-1 .9.1.2.5.2.8.2 0 0 .1 0 .1-.1z"
    />
  </svg>
)

const providers = [
  { id: "google", label: "Continue with Google", icon: <GoogleIcon /> },
  { id: "azure-ad", label: "Continue with Microsoft", icon: <MicrosoftIcon /> },
  { id: "apple", label: "Continue with Apple", icon: <AppleIcon /> },
]

export function SocialButtons({ redirectTo = "/onboarding" }: SocialButtonsProps) {
  const handleClick = (provider: string) => {
    void signIn(provider, { callbackUrl: redirectTo })
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => handleClick(provider.id)}
          className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
        >
          {provider.icon}
          {provider.label}
        </button>
      ))}
      <p className="text-center text-xs text-muted-foreground">We never share your email.</p>
    </div>
  )
}

