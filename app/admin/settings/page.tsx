"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

// Extended settings type to include notification preferences
interface Settings {
  id: number
  site_name: string
  site_url: string
  site_description: string
  contact_email: string
  contact_phone: string
  address: string
  primary_color: string
  dark_mode: boolean
  animations: boolean
  font: string
  email_notifications?: boolean
  sms_notifications?: boolean
  browser_notifications?: boolean
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null)
  const { user, updatePassword } = useAuth()

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single()

        if (error) {
          if (error.message.includes("does not exist")) {
            // Create default settings if table doesn't exist
            await setupDefaultSettings()
            return
          }
          throw error
        }

        setSettings(data as Settings)
      } catch (error) {
        console.error("Error loading settings:", error)
        // Try to create default settings
        await setupDefaultSettings()
      } finally {
        setIsLoading(false)
      }
    }

    async function setupDefaultSettings() {
      try {
        const defaultSettings = {
          id: 1,
          site_name: "JL Surveying & Services",
          site_url: "https://jlsurveying.com",
          site_description: "Professional surveying and construction services for all your needs.",
          contact_email: "info@jlsurveying.com",
          contact_phone: "(123) 456-7890",
          address: "123 Main Street, City, State 12345, United States",
          primary_color: "#FFD700",
          dark_mode: false,
          animations: true,
          font: "Inter",
          email_notifications: true,
          sms_notifications: false,
          browser_notifications: true,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase.from("settings").upsert([defaultSettings]).select().single()

        if (error) throw error
        setSettings(data as Settings)
      } catch (error) {
        console.error("Error creating default settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!settings) return

    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!settings) return

    setSettings({
      ...settings,
      [name]: checked,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setIsSaving(true)
    setSaveStatus(null)

    try {
      const { error } = await supabase
        .from("settings")
        .update({
          site_name: settings.site_name,
          site_url: settings.site_url,
          site_description: settings.site_description,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          address: settings.address,
          primary_color: settings.primary_color,
          dark_mode: settings.dark_mode,
          animations: settings.animations,
          font: settings.font,
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          browser_notifications: settings.browser_notifications,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)

      if (error) throw error

      // Apply dark mode setting
      if (settings.dark_mode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      setSaveStatus({
        success: true,
        message: "Settings saved successfully!",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    } catch (error: any) {
      console.error("Error saving settings:", error)
      setSaveStatus({
        success: false,
        message: error.message || "Failed to save settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset status messages
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validate inputs
    if (!currentPassword) {
      setPasswordError("Current password is required")
      return
    }

    if (!newPassword) {
      setPasswordError("New password is required")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    setIsChangingPassword(true)

    try {
      // Use the updatePassword function from auth context
      const result = await updatePassword(currentPassword, newPassword)

      if (!result.success) {
        setPasswordError(result.error || "Failed to change password")
        return
      }

      setPasswordSuccess("Password changed successfully")

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)
      setPasswordError(error.message || "Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your website settings and preferences.</p>
        </div>

        <Card>
          <CardContent className="py-10">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-24 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your website settings and preferences.</p>
        </div>

        <Card>
          <CardContent className="py-10 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Settings</h3>
            <p className="text-muted-foreground mb-4">Unable to load settings. Please try refreshing the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your website settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your basic website information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input id="site_name" name="site_name" value={settings.site_name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_url">Site URL</Label>
                    <Input id="site_url" name="site_url" value={settings.site_url} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    name="site_description"
                    value={settings.site_description}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      value={settings.contact_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      value={settings.contact_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" name="address" value={settings.address} onChange={handleChange} />
                </div>

                {saveStatus && (
                  <div
                    className={`p-3 rounded-md flex items-center gap-2 ${
                      saveStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {saveStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{saveStatus.message}</span>
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark_mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable dark mode for your website</p>
                    </div>
                    <Switch
                      id="dark_mode"
                      checked={settings.dark_mode}
                      onCheckedChange={(checked) => handleSwitchChange("dark_mode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="animations">Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable animations and transitions</p>
                    </div>
                    <Switch
                      id="animations"
                      checked={settings.animations}
                      onCheckedChange={(checked) => handleSwitchChange("animations", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      name="primary_color"
                      value={settings.primary_color}
                      onChange={handleChange}
                      className="w-32"
                    />
                    <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: settings.primary_color }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font">Font</Label>
                  <select
                    id="font"
                    name="font"
                    value={settings.font}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>

                {saveStatus && (
                  <div
                    className={`p-3 rounded-md flex items-center gap-2 ${
                      saveStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {saveStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{saveStatus.message}</span>
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={settings.email_notifications ?? true}
                      onCheckedChange={(checked) => handleSwitchChange("email_notifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms_notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={settings.sms_notifications ?? false}
                      onCheckedChange={(checked) => handleSwitchChange("sms_notifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="browser_notifications">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                    </div>
                    <Switch
                      id="browser_notifications"
                      checked={settings.browser_notifications ?? true}
                      onCheckedChange={(checked) => handleSwitchChange("browser_notifications", checked)}
                    />
                  </div>
                </div>

                {saveStatus && (
                  <div
                    className={`p-3 rounded-md flex items-center gap-2 ${
                      saveStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {saveStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{saveStatus.message}</span>
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-md flex items-center gap-2 bg-red-100 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-md flex items-center gap-2 bg-green-100 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing Password..." : "Change Password"}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user?.email || "admin@jlsurveying.com"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize">{user?.role || "admin"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced settings for your website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analytics_id">Google Analytics ID</Label>
                  <Input id="analytics_id" placeholder="UA-XXXXXXXXX-X" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_tags">Meta Tags</Label>
                  <Textarea
                    id="meta_tags"
                    placeholder="<meta name='description' content='Your description here'>"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robots_txt">robots.txt</Label>
                  <Textarea
                    id="robots_txt"
                    defaultValue="User-agent: *
Allow: /"
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put your website in maintenance mode</p>
                  </div>
                  <Switch id="maintenance_mode" />
                </div>

                {saveStatus && (
                  <div
                    className={`p-3 rounded-md flex items-center gap-2 ${
                      saveStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {saveStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{saveStatus.message}</span>
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

