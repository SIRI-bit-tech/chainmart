import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, displayName } = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        password,
        display_name: displayName,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()

    // Return success without setting cookies - NextAuth will handle authentication
    return NextResponse.json({ success: true, message: "Registration successful" })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 })
  }
}
