"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Building,
  FileText,
  MessageSquare,
  Newspaper,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  AlertTriangle,
} from "lucide-react"
import { supabase, tableExists } from "@/lib/supabase"
import { AddServiceForm } from "@/components/admin/add-service-form"
import { AddProjectForm } from "@/components/admin/add-project-form"
import { AddNewsForm } from "@/components/admin/add-news-form"
import { AddTeamMemberForm } from "@/components/admin/add-team-member-form"
import { DatabaseSetup } from "@/components/admin/database-setup"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: { count: 0, trend: "neutral" as "up" | "down" | "neutral", change: "No change" },
    services: { count: 0, trend: "neutral" as "up" | "down" | "neutral", change: "No change" },
    news: { count: 0, trend: "neutral" as "up" | "down" | "neutral", change: "No change" },
    messages: { count: 0, trend: "neutral" as "up" | "down" | "neutral", change: "No change" },
  })

  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [recentNews, setRecentNews] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [databaseReady, setDatabaseReady] = useState(true)

  useEffect(() => {
    async function checkDatabase() {
      const projectsExist = await tableExists("projects")
      const servicesExist = await tableExists("services")
      const newsExist = await tableExists("news")
      const messagesExist = await tableExists("messages")
      const teamExist = await tableExists("team")
      const settingsExist = await tableExists("settings")

      const allTablesExist = projectsExist && servicesExist && newsExist && messagesExist && teamExist && settingsExist
      setDatabaseReady(allTablesExist)

      if (allTablesExist) {
        fetchDashboardData()
      } else {
        setIsLoading(false)
      }
    }

    checkDatabase()
  }, [])

  async function fetchDashboardData() {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch counts
      const [projectsRes, servicesRes, newsRes, messagesRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact" }),
        supabase.from("services").select("id", { count: "exact" }),
        supabase.from("news").select("id", { count: "exact" }),
        supabase.from("messages").select("id", { count: "exact" }),
      ])

      // Fetch recent items
      const [recentProjectsRes, recentNewsRes, recentMessagesRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("news").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(3),
      ])

      setStats({
        projects: {
          count: projectsRes.count || 0,
          trend: "up",
          change: "+2 from last month",
        },
        services: {
          count: servicesRes.count || 0,
          trend: "neutral",
          change: "No change",
        },
        news: {
          count: newsRes.count || 0,
          trend: "up",
          change: "+3 from last month",
        },
        messages: {
          count: messagesRes.count || 0,
          trend: "down",
          change: "-5 from last month",
        },
      })

      setRecentProjects(recentProjectsRes.data || [])
      setRecentNews(recentNewsRes.data || [])
      setRecentMessages(recentMessagesRes.data || [])
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message || "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  if (!databaseReady) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the JL Surveying & Services admin dashboard.</p>
          </div>
        </div>

        <DatabaseSetup />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to the JL Surveying & Services admin dashboard.</p>
          </div>
        </div>

        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the JL Surveying & Services admin dashboard.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Content</DialogTitle>
                <DialogDescription>Select the type of content you want to add to your website.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="service" className="mt-4">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="project">Project</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>
                <TabsContent value="service">
                  <AddServiceForm onSuccess={fetchDashboardData} />
                </TabsContent>
                <TabsContent value="project">
                  <AddProjectForm onSuccess={fetchDashboardData} />
                </TabsContent>
                <TabsContent value="news">
                  <AddNewsForm onSuccess={fetchDashboardData} />
                </TabsContent>
                <TabsContent value="team">
                  <AddTeamMemberForm onSuccess={fetchDashboardData} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Projects",
            value: stats.projects.count.toString(),
            description: stats.projects.change,
            icon: Building,
            trend: stats.projects.trend,
          },
          {
            title: "Services",
            value: stats.services.count.toString(),
            description: stats.services.change,
            icon: FileText,
            trend: stats.services.trend,
          },
          {
            title: "News Articles",
            value: stats.news.count.toString(),
            description: stats.news.change,
            icon: Newspaper,
            trend: stats.news.trend,
          },
          {
            title: "Messages",
            value: stats.messages.count.toString(),
            description: stats.messages.change,
            icon: MessageSquare,
            trend: stats.messages.trend,
          },
        ].map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {item.trend === "up" && <ArrowUp className="h-3 w-3 text-green-500" />}
                {item.trend === "down" && <ArrowDown className="h-3 w-3 text-red-500" />}
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-4">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px] flex items-center justify-center border rounded-md">
              <BarChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-muted" />
                        <div className="flex-1">
                          <p className="text-sm font-medium bg-muted h-4 w-3/4 rounded animate-pulse"></p>
                          <p className="text-xs text-muted-foreground bg-muted h-3 w-1/2 rounded mt-1 animate-pulse"></p>
                        </div>
                      </div>
                    ))
                : [
                    ...recentProjects.map((p) => ({
                      title: `New project added: ${p.title}`,
                      time: new Date(p.created_at).toLocaleString(),
                    })),
                    ...recentNews.map((n) => ({
                      title: `New article published: ${n.title}`,
                      time: new Date(n.created_at).toLocaleString(),
                    })),
                    ...recentMessages.map((m) => ({
                      title: `New message from: ${m.name}`,
                      time: new Date(m.created_at).toLocaleString(),
                    })),
                  ]
                    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                    .slice(0, 4)
                    .map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}

              {!isLoading && recentProjects.length === 0 && recentNews.length === 0 && recentMessages.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/projects" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium bg-muted h-4 w-40 rounded animate-pulse"></p>
                        <p className="text-xs text-muted-foreground bg-muted h-3 w-20 rounded animate-pulse"></p>
                      </div>
                      <div className="bg-muted h-8 w-16 rounded animate-pulse"></div>
                    </div>
                  ))
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.category}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No projects found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent News</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/news" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium bg-muted h-4 w-40 rounded animate-pulse"></p>
                        <p className="text-xs text-muted-foreground bg-muted h-3 w-20 rounded animate-pulse"></p>
                      </div>
                      <div className="bg-muted h-8 w-16 rounded animate-pulse"></div>
                    </div>
                  ))
              ) : recentNews.length > 0 ? (
                recentNews.map((news) => (
                  <div key={news.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{news.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {news.publish_date ? new Date(news.publish_date).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/news/${news.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No news articles found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Messages</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/messages" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium bg-muted h-4 w-40 rounded animate-pulse"></p>
                        <p className="text-xs text-muted-foreground bg-muted h-3 w-20 rounded animate-pulse"></p>
                      </div>
                      <div className="bg-muted h-8 w-16 rounded animate-pulse"></div>
                    </div>
                  ))
              ) : recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/messages/${message.id}`}>View</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No messages found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

