import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
})

export type Service = {
  id: number
  title: string
  description: string
  image_url: string
  features: string[]
  icon: string
  created_at: string
}

export type Project = {
  id: number
  title: string
  description: string
  image_url: string
  location: string
  completion_date: string
  category: string
  details: string
  created_at: string
}

export type NewsArticle = {
  id: number
  title: string
  description: string
  content: string
  image_url: string
  author: string
  publish_date: string
  created_at: string
}

export type TeamMember = {
  id: number
  name: string
  position: string
  bio: string
  image_url: string
  created_at: string
}

export type Message = {
  id: number
  name: string
  email: string
  phone: string
  message: string
  read: boolean
  created_at: string
}

export type Settings = {
  id: number
  site_name: string
  site_url: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
  primary_color: string
  dark_mode: boolean
  animations: boolean
  font: string
  updated_at: string
}

// Helper function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("id").limit(1)
    return !error
  } catch (error) {
    return false
  }
}

// Helper function to get settings
export async function getSettings(): Promise<Settings | null> {
  try {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single()

    if (error) {
      console.error("Error fetching settings:", error)
      return null
    }

    return data as Settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

// Helper function to revalidate pages
export async function revalidatePage(path: string) {
  try {
    await fetch(`/api/revalidate?path=${path}`, {
      method: "POST",
    })
    return true
  } catch (error) {
    console.error("Error revalidating page:", error)
    return false
  }
}

