"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
// Import the revalidatePage function
import { supabase, revalidatePage } from "@/lib/supabase"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    author: "",
    publish_date: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    async function fetchNewsArticle() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("news").select("*").eq("id", params.id).single()

        if (error) throw error

        setFormState({
          title: data.title || "",
          description: data.description || "",
          content: data.content || "",
          image_url: data.image_url || "",
          author: data.author || "",
          publish_date: data.publish_date ? new Date(data.publish_date).toISOString().split("T")[0] : "",
        })
      } catch (error: any) {
        console.error("Error fetching news article:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewsArticle()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const { error } = await supabase
        .from("news")
        .update({
          title: formState.title,
          description: formState.description,
          content: formState.content,
          image_url: formState.image_url,
          author: formState.author,
          publish_date: formState.publish_date,
        })
        .eq("id", params.id)

      if (error) throw error

      // Revalidate the news page
      await revalidatePage("/news")

      setSubmitStatus({
        success: true,
        message: "News article updated successfully!",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } catch (error: any) {
      console.error("Error updating news article:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to update news article. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading News Article</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/news">Back to News</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit News Article</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-24 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-24 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleChange}
                  placeholder="e.g., JL Surveying Completes Major Downtown Project"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  placeholder="Brief description of the article..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content (HTML supported)</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formState.content}
                  onChange={handleChange}
                  placeholder="<p>Full article content...</p>"
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formState.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formState.author}
                    onChange={handleChange}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publish_date">Publish Date</Label>
                  <Input
                    id="publish_date"
                    name="publish_date"
                    type="date"
                    value={formState.publish_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {submitStatus && (
                <div
                  className={`p-3 rounded-md flex items-center gap-2 ${
                    submitStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {submitStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.push("/admin/news")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

