"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, revalidatePage } from "@/lib/supabase"
import { FileText, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddServiceForm } from "@/components/admin/add-service-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setServices(data || [])
    } catch (error: any) {
      console.error("Error fetching services:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setServiceToDelete(id)
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("services").delete().eq("id", id)

      if (error) {
        throw error
      }

      // If successful, update the local state
      setServices((prevServices) => prevServices.filter((service) => service.id !== id))

      // Revalidate the services page
      await revalidatePage("/services")

      // Show success message
      toast({
        title: "Success",
        description: "Service deleted successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting service:", error)

      // Show error message
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setServiceToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your services offerings.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>Fill out the form below to add a new service to your website.</DialogDescription>
            </DialogHeader>
            <AddServiceForm onSuccess={fetchServices} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-4 border rounded-md animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-5 bg-muted w-1/4 rounded"></div>
                      <div className="h-5 bg-muted w-1/6 rounded"></div>
                    </div>
                    <div className="h-4 bg-muted w-3/4 rounded mb-2"></div>
                    <div className="h-4 bg-muted w-1/2 rounded"></div>
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchServices} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {service.title}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/services/${service.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the service.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(service.id)} disabled={isDeleting}>
                            {isDeleting && serviceToDelete === service.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first service.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                    <DialogDescription>Fill out the form below to add a new service to your website.</DialogDescription>
                  </DialogHeader>
                  <AddServiceForm onSuccess={fetchServices} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

