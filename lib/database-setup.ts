import { supabase } from "./supabase"
import { databaseSchema } from "./database-schema"

export async function setupDatabase() {
  try {
    // Execute the SQL schema
    const { error } = await supabase.rpc("exec_sql", { sql: databaseSchema })

    if (error) {
      console.error("Error setting up database:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error setting up database:", error)
    return false
  }
}

