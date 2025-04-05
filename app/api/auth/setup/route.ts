import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { hashPassword } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if admin_users table exists
    const { error: tableCheckError } = await supabase.from("admin_users").select("id").limit(1)

    if (tableCheckError) {
      if (tableCheckError.message.includes("does not exist")) {
        // Create admin_users table if it doesn't exist
        const { error: createTableError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS public.admin_users (
              id SERIAL PRIMARY KEY,
              email TEXT NOT NULL UNIQUE,
              password_hash TEXT NOT NULL,
              name TEXT,
              role TEXT DEFAULT 'admin',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              last_login TIMESTAMP WITH TIME ZONE
            );
            ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;
          `,
        })

        if (createTableError) {
          return NextResponse.json(
            { success: false, message: "Failed to create admin_users table", error: createTableError },
            { status: 500 },
          )
        }
      } else {
        return NextResponse.json(
          { success: false, message: "Error checking admin_users table", error: tableCheckError },
          { status: 500 },
        )
      }
    }

    // Hash the default password
    const defaultPassword = "admin123"
    const hashedPassword = await hashPassword(defaultPassword)

    // Check if admin user already exists
    const { data: existingUser, error: checkUserError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", "admin@jlsurveying.com")
      .single()

    if (!checkUserError && existingUser) {
      // Update existing admin user
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({ password_hash: hashedPassword })
        .eq("id", existingUser.id)

      if (updateError) {
        return NextResponse.json(
          { success: false, message: "Failed to update admin user", error: updateError },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Admin user updated successfully",
        credentials: { email: "admin@jlsurveying.com", password: defaultPassword },
      })
    } else {
      // Create new admin user
      const { error: insertError } = await supabase.from("admin_users").insert([
        {
          email: "admin@jlsurveying.com",
          password_hash: hashedPassword,
          name: "Admin User",
          role: "admin",
        },
      ])

      if (insertError) {
        return NextResponse.json(
          { success: false, message: "Failed to create admin user", error: insertError },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully",
        credentials: { email: "admin@jlsurveying.com", password: defaultPassword },
      })
    }
  } catch (error: any) {
    console.error("Error setting up admin user:", error)
    return NextResponse.json({ success: false, message: "An error occurred", error: error.message }, { status: 500 })
  }
}

