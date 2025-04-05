"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase, revalidatePage } from "@/lib/supabase"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AddNewsFormProps {
  onSuccess?: () => void
}

export function AddNewsForm({ onSuccess }: AddNewsFormProps) {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    author: "",
    publish_date: new Date().toISOString().split("T")[0],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null)

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
      const { error } = await supabase.from("news").insert([
        {
          title: formState.title,
          description: formState.description,
          content: formState.content,
          image_url: formState.image_url,
          author: formState.author,
          publish_date: formState.publish_date,
        },
      ])

      if (error) throw error

      setSubmitStatus({
        success: true,
        message: "News article added successfully!",
      })

      // Reset form
      setFormState({
        title: "",
        description: "",
        content: "",
        image_url: "",
        author: "",
        publish_date: new Date().toISOString().split("T")[0],
      })

      // Revalidate the news page
      await revalidatePage("/news")

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error adding news article:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to add news article. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add News Article"}
      </Button>
    </form>
  )
}

