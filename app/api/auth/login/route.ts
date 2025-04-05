import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Check if admin_users table exists
    const { error: tableCheckError } = await supabase.from("admin_users").select("id").limit(1)

    if (tableCheckError) {
      if (tableCheckError.message.includes("does not exist")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Admin users table does not exist. Please use the 'Setup Default Admin' button to set up the database.",
          },
          { status: 404 },
        )
      }
      return NextResponse.json(
        {
          success: false,
          error: "Database error. Please try again or contact support.",
        },
        { status: 500 },
      )
    }

    // Fetch user with matching email
    const { data, error } = await supabase.from("admin_users").select("*").eq("email", email.toLowerCase()).single()

    if (error) {
      if (error.message.includes("no rows returned")) {
        return NextResponse.json({ success: false, error: "User not found. Please check your email." }, { status: 401 })
      }
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, data.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }

    // Update last login time
    await supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", data.id)

    // Return user data (excluding password)
    const userData = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    }

    return NextResponse.json({ success: true, user: userData })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during login" },
      { status: 500 },
    )
  }
}

