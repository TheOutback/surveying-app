"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, MessageSquare, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ContactPage() {
  const [settings, setSettings] = useState({
    contact_email: "info@jlsurveying.com",
    contact_phone: "(123) 456-7890",
    address: "123 Main Street, City, State 12345, United States",
  })

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [setupRequired, setSetupRequired] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("contact_email, contact_phone, address")
          .eq("id", 1)
          .single()

        if (error) {
          console.error("Error fetching settings:", error)
          return
        }

        if (data) {
          setSettings({
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            address: data.address,
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setSetupRequired(false)

    try {
      // Check if the messages table exists
      const { error: tableCheckError } = await supabase.from("messages").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes("does not exist")) {
          setSetupRequired(true)
          throw new Error("The messages table doesn't exist in the database. Please set up your database tables first.")
        }
        throw tableCheckError
      }

      const { error } = await supabase.from("messages").insert([
        {
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          message: formState.message,
          read: false,
        },
      ])

      if (error) throw error

      setSubmitSuccess(true)
      setFormState({
        name: "",
        email: "",
        phone: "",
        message: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error: any) {
      console.error("Error submitting message:", error)
      setSubmitError(error.message || "There was an error submitting your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact Us</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Get in touch with our team for inquiries, quotes, or more information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
        <div>
          <div className="relative h-48 sm:h-64 w-full rounded-lg overflow-hidden mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0093.png-nq13IYQcowhuITXD3wJkAQK2dpaKF8.jpeg"
              alt="Contact Us"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <MapPin className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <CardTitle>Our Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base whitespace-pre-line">{settings.address}</CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Phone className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <CardTitle>Phone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-primary transition-colors">
                    {settings.contact_phone}
                  </a>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Mail className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <CardTitle>Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">
                    {settings.contact_email}
                  </a>
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <MessageSquare className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <CardTitle>Social & Messaging</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://wa.me/${settings.contact_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`sms:${settings.contact_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SMS
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            {setupRequired ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Database Setup Required</h3>
                    <p className="text-sm text-amber-700 mb-2">
                      The contact form requires database setup before it can store messages.
                    </p>
                    <p className="text-sm text-amber-700">
                      Please ask your administrator to set up the required database tables.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setSetupRequired(false)}>
                  Try Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={formState.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message"
                    rows={5}
                    value={formState.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                {submitSuccess && (
                  <div className="p-3 bg-green-100 text-green-800 rounded-md text-center">
                    Your message has been sent successfully! We'll get back to you soon.
                  </div>
                )}

                {submitError && !setupRequired && (
                  <div className="p-3 bg-red-100 text-red-800 rounded-md text-center">{submitError}</div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

