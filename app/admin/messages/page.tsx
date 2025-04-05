"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Message } from "@/lib/supabase"
import { Eye, ArrowLeft, ArrowRight, Mail, MailOpen, AlertTriangle } from "lucide-react"

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const messagesPerPage = 10

  useEffect(() => {
    async function fetchMessages() {
      setIsLoading(true)
      setError(null)
      try {
        // Check if the table exists first
        const { error: tableCheckError } = await supabase.from("messages").select("id").limit(1)

        if (tableCheckError) {
          if (tableCheckError.message.includes("does not exist")) {
            setError("The messages table doesn't exist yet. Please set up your database tables first.")
            setIsLoading(false)
            return
          }
          throw tableCheckError
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase.from("messages").select("*", { count: "exact" })

        if (countError) throw countError

        // Calculate total pages
        const total = count || 0
        setTotalPages(Math.ceil(total / messagesPerPage))

        // Fetch messages for current page
        const from = (currentPage - 1) * messagesPerPage
        const to = from + messagesPerPage - 1

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, to)

        if (error) throw error

        setMessages(data as Message[])
      } catch (error: any) {
        console.error("Error fetching messages:", error)
        setError(error.message || "Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [currentPage])

  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase.from("messages").update({ read: true }).eq("id", id)

      if (error) throw error

      // Update local state
      setMessages(messages.map((message) => (message.id === id ? { ...message, read: true } : message)))
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">View and manage messages from your contact form.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-4 border rounded-md animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-5 bg-muted w-1/4 rounded"></div>
                      <div className="h-5 bg-muted w-1/6 rounded"></div>
                    </div>
                    <div className="h-4 bg-muted w-3/4 rounded mb-2"></div>
                    <div className="h-4 bg-muted w-1/2 rounded"></div>
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Database Setup Required</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 max-w-2xl mx-auto text-left">
                <h4 className="font-medium text-amber-800 mb-2">Setup Instructions:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-amber-700">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to the SQL Editor</li>
                  <li>Run the following SQL to create the required tables:</li>
                </ol>
                <pre className="bg-amber-100 p-3 rounded mt-3 overflow-x-auto text-xs text-amber-800">
                  {`-- Create messages table
CREATE TABLE public.messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  features TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'FileText',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  image_url TEXT,
  location TEXT NOT NULL,
  completion_date DATE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  author TEXT NOT NULL,
  publish_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team table
CREATE TABLE public.team (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`}
                </pre>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium flex items-center gap-2">
                      {message.read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                      {message.name}
                      {!message.read && (
                        <Badge variant="outline" className="ml-2 bg-primary/10">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{new Date(message.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm mb-2">{message.email}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{message.message}</div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/messages/${message.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    {!message.read && (
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => markAsRead(message.id)}>
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground">
                When visitors send messages through your contact form, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

