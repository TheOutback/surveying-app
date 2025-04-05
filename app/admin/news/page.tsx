"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Newspaper, Plus, Pencil, Trash2, Calendar, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddNewsForm } from "@/components/admin/add-news-form"
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

// Import the revalidatePage function
import { revalidatePage } from "@/lib/supabase"

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  async function fetchNews() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setNewsArticles(data || [])
    } catch (error: any) {
      console.error("Error fetching news:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleDelete function
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("news").delete().eq("id", id)

      if (error) throw error

      // Revalidate the news page
      await revalidatePage("/news")

      // Refresh the list
      fetchNews()
    } catch (error) {
      console.error("Error deleting news article:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">News</h1>
          <p className="text-muted-foreground">Manage your news articles and announcements.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add News Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add News Article</DialogTitle>
              <DialogDescription>Fill out the form below to add a new news article to your website.</DialogDescription>
            </DialogHeader>
            <AddNewsForm onSuccess={fetchNews} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All News Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
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
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchNews} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : newsArticles.length > 0 ? (
            <div className="space-y-4">
              {newsArticles.map((article) => (
                <div key={article.id} className="p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={article.image_url || "/placeholder.svg?height=128&width=128"}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Newspaper className="h-4 w-4 text-primary" />
                            {article.title}
                          </h3>
                          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.description}</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 text-sm mt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {article.publish_date ? new Date(article.publish_date).toLocaleDateString() : "No date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{article.author}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/news/${article.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the news article.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No news articles yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first news article.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add News Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add News Article</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to add a new news article to your website.
                    </DialogDescription>
                  </DialogHeader>
                  <AddNewsForm onSuccess={fetchNews} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

