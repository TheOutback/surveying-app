"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { databaseSchema } from "@/lib/database-schema"

export function DatabaseSetup() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupStatus, setSetupStatus] = useState<{ success: boolean; message: string } | null>(null)

  const handleSetupDatabase = async () => {
    setIsSettingUp(true)
    setSetupStatus(null)

    try {
      // Execute the SQL schema
      const { error } = await supabase.rpc("exec_sql", { sql: databaseSchema })

      if (error) throw error

      setSetupStatus({
        success: true,
        message: "Database tables created successfully! Refresh the page to continue.",
      })
    } catch (error: any) {
      console.error("Error setting up database:", error)
      setSetupStatus({
        success: false,
        message: error.message || "Failed to set up database. Please try again.",
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <Card>
      <CardContent className="py-10">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Database Setup Required</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your database tables need to be set up before you can use the admin dashboard.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 max-w-2xl mx-auto text-left mb-6 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-amber-800 mb-2">Setup Instructions:</h4>
            <p className="text-amber-700 mb-4">
              Click the button below to automatically set up your database tables. This will create all the necessary
              tables for your website.
            </p>
            <p className="text-amber-700 mb-4">
              Alternatively, you can manually run the SQL in your Supabase dashboard SQL Editor.
            </p>
          </div>

          {setupStatus && (
            <div
              className={`p-3 rounded-md flex items-center gap-2 mb-6 ${
                setupStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {setupStatus.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <span>{setupStatus.message}</span>
            </div>
          )}

          <Button
            onClick={handleSetupDatabase}
            disabled={isSettingUp || setupStatus?.success}
            className="w-full sm:w-auto"
          >
            {isSettingUp ? "Setting Up..." : "Set Up Database Tables"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

