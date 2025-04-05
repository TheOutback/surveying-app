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

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    image_url: "",
    features: "",
    icon: "MapPin",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    async function fetchService() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("services").select("*").eq("id", params.id).single()

        if (error) throw error

        setFormState({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          features: Array.isArray(data.features) ? data.features.join(", ") : "",
          icon: data.icon || "MapPin",
        })
      } catch (error: any) {
        console.error("Error fetching service:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchService()
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
      icon: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Convert features string to array
      const featuresArray = formState.features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0)

      const { error } = await supabase
        .from("services")
        .update({
          title: formState.title,
          description: formState.description,
          image_url: formState.image_url,
          features: featuresArray,
          icon: formState.icon,
        })
        .eq("id", params.id)

      if (error) throw error

      // Revalidate the services page
      await revalidatePage("/services")

      setSubmitStatus({
        success: true,
        message: "Service updated successfully!",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    } catch (error: any) {
      console.error("Error updating service:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to update service. Please try again.",
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
            <Link href="/admin/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Service</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/services">Back to Services</Link>
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
            <Link href="/admin/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Service</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
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
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleChange}
                  placeholder="e.g., Land Surveying"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  placeholder="Describe the service..."
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

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma separated)</Label>
                <Textarea
                  id="features"
                  name="features"
                  value={formState.features}
                  onChange={handleChange}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={formState.icon} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {["MapPin", "Building2", "Ruler", "Compass", "Hammer", "FileText"].map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
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
                <Button variant="outline" type="button" onClick={() => router.push("/admin/services")}>
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

