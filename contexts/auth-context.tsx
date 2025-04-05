"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

type User = {
  id: number
  email: string
  name: string | null
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("jl-admin-user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // Redirect if accessing admin pages without auth
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname?.startsWith("/admin") && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [loading, isAuthenticated, pathname, router])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Invalid email or password" }
      }

      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem("jl-admin-user", JSON.stringify(data.user))

      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "An error occurred during login" }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        return { success: false, error: "You must be logged in to change your password" }
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || "Failed to update password" }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Password update error:", error)
      return { success: false, error: error.message || "An error occurred while updating password" }
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      localStorage.removeItem("jl-admin-user")
      setUser(null)
      setIsAuthenticated(false)
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

