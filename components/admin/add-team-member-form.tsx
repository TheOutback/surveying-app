"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase, revalidatePage } from "@/lib/supabase"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AddTeamMemberFormProps {
  onSuccess?: () => void
}

export function AddTeamMemberForm({ onSuccess }: AddTeamMemberFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    position: "",
    bio: "",
    image_url: "",
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
      const { error } = await supabase.from("team").insert([
        {
          name: formState.name,
          position: formState.position,
          bio: formState.bio,
          image_url: formState.image_url,
        },
      ])

      if (error) throw error

      setSubmitStatus({
        success: true,
        message: "Team member added successfully!",
      })

      // Reset form
      setFormState({
        name: "",
        position: "",
        bio: "",
        image_url: "",
      })

      // Revalidate the about page
      await revalidatePage("/about")

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error adding team member:", error)
      setSubmitStatus({
        success: false,
        message: error.message || "Failed to add team member. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="e.g., John Smith"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          name="position"
          value={formState.position}
          onChange={handleChange}
          placeholder="e.g., Lead Surveyor"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          placeholder="Brief biography..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Profile Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formState.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
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
        {isSubmitting ? "Adding..." : "Add Team Member"}
      </Button>
    </form>
  )
}

