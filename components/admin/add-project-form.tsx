"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, revalidatePage } from "@/lib/supabase"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AddProjectFormProps {
  onSuccess?: () => void
}

export function AddProjectForm({ onSuccess }: AddProjectFormProps) {
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
      const { error } = await supabase.from("projects").insert([
        {
          title: formState.title,
          description: formState.description,
          details: formState.details,
          image_url: formState.image_url,
          location: formState.location,
          completion_date: formState.completion_date,
          category: formState.category,
        },
      ])

      if (error) throw error

      setSubmitStatus({
        success: true,
        message: "Project added successfully!",
      })

      // Reset form
      setFormState({
        title: "",
        description: "",
        details: "",
        image_url: "",
        location: "",
        completion_date: "",
        category: "Commercial",
      })

      // Revalidate the projects page
      await revalidatePage("/projects")

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error adding project:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to add project. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
            {["Commercial", "Residential", "Industrial", "Mixed-Use", "Land Development", "Infrastructure"].map(
              (category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ),
            )}
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Project"}
      </Button>
    </form>
  )
}

