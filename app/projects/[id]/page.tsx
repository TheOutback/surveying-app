import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Project } from "@/lib/supabase"

// Add this export to make the page dynamic
export const dynamic = "force-dynamic"

async function getProject(id: string) {
  try {
    const { data, error } = await supabase.from("projects").select("*").eq("id", Number.parseInt(id)).single()

    if (error) {
      console.error("Error fetching project:", error)
      return null
    }

    return data as Project
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

// Generate static params for all projects
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("projects").select("id")
    return (data || []).map((project) => ({
      id: project.id.toString(),
    }))
  } catch (error) {
    return []
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) {
    // If project doesn't exist, use a default project for demo purposes
    const defaultProject = {
      id: Number.parseInt(params.id),
      title: "Sample Project",
      description: "This is a sample project description for demonstration purposes.",
      details:
        "<p>This is a detailed description of the project. It includes information about the scope, challenges, and outcomes of the project.</p><p>The project was completed on time and within budget, meeting all client requirements.</p>",
      image_url: "/placeholder.svg?height=400&width=600",
      location: "Sample Location",
      completion_date: new Date().toISOString(),
      category: "Sample Category",
      created_at: new Date().toISOString(),
    }

    return (
      <div className="container py-12 md:py-24">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/projects" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-64 sm:h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={defaultProject.image_url || "/placeholder.svg"}
                alt={defaultProject.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {defaultProject.category}
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{defaultProject.title}</h1>

            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{defaultProject.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Completed: {new Date(defaultProject.completion_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-muted-foreground">{defaultProject.description}</p>
              <div className="mt-6" dangerouslySetInnerHTML={{ __html: defaultProject.details || "" }} />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Project Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm">{defaultProject.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm">{defaultProject.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm font-medium">Completion Date:</span>
                    <span className="text-sm">{new Date(defaultProject.completion_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Need a Similar Project?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact us to discuss your project requirements and get a free quote.
                </p>
                <Button asChild className="w-full">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/projects" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 sm:h-96 w-full rounded-lg overflow-hidden">
            <Image
              src={project.image_url || "/placeholder.svg?height=400&width=600"}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {project.category}
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{project.title}</h1>

          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Completed: {new Date(project.completion_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground">{project.description}</p>
            <div className="mt-6" dangerouslySetInnerHTML={{ __html: project.details || "" }} />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Project Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium">Category:</span>
                  <span className="text-sm">{project.category}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm">{project.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium">Completion Date:</span>
                  <span className="text-sm">{new Date(project.completion_date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Need a Similar Project?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact us to discuss your project requirements and get a free quote.
              </p>
              <Button asChild className="w-full">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

