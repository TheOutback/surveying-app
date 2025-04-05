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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Import the revalidatePage function
import { supabase, revalidatePage } from "@/lib/supabase"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

const categoryOptions = ["Commercial", "Residential", "Industrial", "Mixed-Use", "Land Development", "Infrastructure"]

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    details: "",
    image_url: "",
    location: "",
    completion_date: "",
    category: "Commercial",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    async function fetchProject() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("projects").select("*").eq("id", params.id).single()

        if (error) throw error

        setFormState({
          title: data.title || "",
          description: data.description || "",
          details: data.details || "",
          image_url: data.image_url || "",
          location: data.location || "",
          completion_date: data.completion_date ? new Date(data.completion_date).toISOString().split("T")[0] : "",
          category: data.category || "Commercial",
        })
      } catch (error: any) {
        console.error("Error fetching project:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormState({
      ...formState,
      category: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: formState.title,
          description: formState.description,
          details: formState.details,
          image_url: formState.image_url,
          location: formState.location,
          completion_date: formState.completion_date,
          category: formState.category,
        })
        .eq("id", params.id)

      if (error) throw error

      // Revalidate the projects page
      await revalidatePage("/projects")

      setSubmitStatus({
        success: true,
        message: "Project updated successfully!",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } catch (error: any) {
      console.error("Error updating project:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to update project. Please try again.",
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
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Project</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/projects">Back to Projects</Link>
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
            <Link href="/admin/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
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
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleChange}
                  placeholder="e.g., Commercial Office Complex"
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
                  placeholder="Brief description of the project..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Full Details (HTML supported)</Label>
                <Textarea
                  id="details"
                  name="details"
                  value={formState.details}
                  onChange={handleChange}
                  placeholder="<p>Detailed description of the project...</p>"
                  rows={5}
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formState.location}
                    onChange={handleChange}
                    placeholder="e.g., Downtown Metro Area"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    name="completion_date"
                    type="date"
                    value={formState.completion_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formState.category} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Button variant="outline" type="button" onClick={() => router.push("/admin/projects")}>
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

