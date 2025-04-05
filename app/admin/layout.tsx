"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  FileText,
  Building,
  Newspaper,
  Users,
  MessageSquare,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react"

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Services", href: "/admin/services", icon: FileText },
  { name: "Projects", href: "/admin/projects", icon: Building },
  { name: "News", href: "/admin/news", icon: Newspaper },
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user } = useAuth()

  // Don't render the admin layout for the login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className={cn("w-64 border-r bg-muted/40 hidden md:block", "transition-all duration-300 ease-in-out")}>
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <div className="bg-jl-black border-2 border-jl-yellow h-8 w-8 flex items-center justify-center">
              <span className="text-jl-white font-bold text-sm">JL</span>
            </div>
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {adminNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}

          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-red-500 hover:bg-red-100 hover:text-red-600 mt-auto"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile sidebar - overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs border-r bg-background animate-in slide-in-from-left">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <div className="bg-jl-black border-2 border-jl-yellow h-8 w-8 flex items-center justify-center">
                  <span className="text-jl-white font-bold text-sm">JL</span>
                </div>
                <span>Admin Dashboard</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {adminNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}

              <button
                onClick={logout}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-red-500 hover:bg-red-100 hover:text-red-600 mt-4"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4">
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="flex items-center md:hidden">
            <div className="bg-jl-black border-2 border-jl-yellow h-8 w-8 flex items-center justify-center">
              <span className="text-jl-white font-bold text-sm">JL</span>
            </div>
            <span className="ml-2 font-semibold">Admin</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user && (
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                Logged in as <span className="font-medium">{user.email}</span>
              </span>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="hidden sm:flex items-center gap-1">
                View Site
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  )
}

