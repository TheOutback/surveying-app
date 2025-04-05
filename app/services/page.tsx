import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Building2, Ruler, Compass, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Service } from "@/lib/supabase"

// Update the getServices function to use dynamic data fetching
async function getServices() {
  const { data, error } = await supabase.from("services").select("*")

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return data as Service[]
}

// Add this export to make the page dynamic
export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const services = await getServices()

  // Map icon strings to components
  const iconMap: Record<string, React.ElementType> = {
    MapPin,
    Building2,
    Ruler,
    Compass,
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Services</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Comprehensive surveying and construction solutions tailored to your needs
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services found. Please add services through the admin dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-12">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap] || MapPin

            return (
              <div key={service.id} className="flex flex-col gap-6">
                <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-lg">
                  <Image
                    src={service.image_url || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <IconComponent className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <CardTitle>{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.features &&
                        service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

