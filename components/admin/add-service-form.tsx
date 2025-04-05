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

interface AddServiceFormProps {
  onSuccess?: () => void
}

export function AddServiceForm({ onSuccess }: AddServiceFormProps) {
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    image_url: "",
    features: "",
    icon: "MapPin",
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

      const { error } = await supabase.from("services").insert([
        {
          title: formState.title,
          description: formState.description,
          image_url: formState.image_url,
          features: featuresArray,
          icon: formState.icon,
        },
      ])

      if (error) throw error

      setSubmitStatus({
        success: true,
        message: "Service added successfully!",
      })

      // Revalidate the services page
      await revalidatePage("/services")

      // Reset form
      setFormState({
        title: "",
        description: "",
        image_url: "",
        features: "",
        icon: "MapPin",
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error adding service:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to add service. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Service"}
      </Button>
    </form>
  )
}

