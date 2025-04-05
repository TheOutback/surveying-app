"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from("settings").select("dark_mode").eq("id", 1).single()

        if (error) {
          console.error("Error fetching settings:", error)
          return
        }

        if (data) {
          setDarkMode(data.dark_mode)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <ThemeProvider attribute="class" defaultTheme={darkMode ? "dark" : "light"} enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollToTop />
      </div>
    </ThemeProvider>
  )
}

