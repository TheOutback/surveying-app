"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Message } from "@/lib/supabase"
import { ArrowLeft, Mail, Phone, Calendar, Trash2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MessageDetailPageProps {
  params: { id: string }
}

export default function MessageDetailPage({ params }: MessageDetailPageProps) {
  const [message, setMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchMessage() {
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

        const { data, error } = await supabase.from("messages").select("*").eq("id", params.id).single()

        if (error) throw error

        setMessage(data as Message)

        // Mark as read if not already
        if (!data.read) {
          await supabase.from("messages").update({ read: true }).eq("id", params.id)
        }
      } catch (error: any) {
        console.error("Error fetching message:", error)
        setError(error.message || "Failed to load message")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessage()
  }, [params.id])

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", params.id)

      if (error) throw error

      router.push("/admin/messages")
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
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
);`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 bg-muted w-1/4 rounded animate-pulse"></div>
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 bg-muted w-1/3 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted w-1/3 rounded"></div>
                  </div>
                ))}
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-muted w-1/4 rounded"></div>
              <div className="h-32 bg-muted w-full rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">Message not found</h3>
            <p className="text-muted-foreground mb-4">
              The message you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/admin/messages">View All Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Message from {message.name}</h1>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the message.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Message Details
            {!message.read && (
              <Badge variant="outline" className="ml-2 bg-primary/10">
                New
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                {message.email}
              </a>
            </div>

            {message.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span>
                <a href={`tel:${message.phone}`} className="text-primary hover:underline">
                  {message.phone}
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Received:</span>
              <span>{new Date(message.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Message:</h3>
            <div className="p-4 border rounded-md whitespace-pre-wrap">{message.message}</div>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <a href={`mailto:${message.email}?subject=Re: Your message to JL Surveying & Services`}>
                Reply via Email
              </a>
            </Button>
            {message.phone && (
              <Button variant="outline" asChild>
                <a href={`tel:${message.phone}`}>Call</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

