import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, message, signature } = await request.json()

    // Forward to Django backend for verification
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-wallet/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address,
        message,
        signature,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()

    // Set authentication cookie
    const res = NextResponse.json(data)
    res.cookies.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 })
  }
}
