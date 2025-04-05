import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { hashPassword, verifyPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json()

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, current password, and new password are required" },
        { status: 400 },
      )
    }

    // Get the user from the database
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update the password in the database
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: hashedPassword })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}

