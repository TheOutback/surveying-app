import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Ruler, Compass, Hammer, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Service, Project } from "@/lib/supabase"
import { Calendar } from "lucide-react"

interface NewsArticle {
  id: string
  created_at?: string
  title: string
  description: string
  image_url?: string
  publish_date: string
}

async function getServices() {
  const { data, error } = await supabase.from("services").select("*").limit(6)

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return data as Service[]
}

async function getProjects() {
  const { data, error } = await supabase.from("projects").select("*").limit(3)

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data as Project[]
}

async function getNews() {
  const { data, error } = await supabase.from("news").select("*").order("publish_date", { ascending: false }).limit(3)

  if (error) {
    console.error("Error fetching news:", error)
    return []
  }

  return data as NewsArticle[]
}

export default async function Home() {
  const services = await getServices()
  const projects = await getProjects()
  const news = await getNews()

  // Map icon strings to components
  const iconMap: Record<string, React.ElementType> = {
    MapPin,
    Building2,
    Ruler,
    Compass,
    Hammer,
    FileText,
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Now using a full image instead of a split layout */}
      <section className="w-full relative">
        <div className="relative h-[60vh] md:h-[80vh] w-full">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0087-FKM1EgFDBSF5fvTaVg1hxPILx8M5js.jpeg"
            alt="JL Surveying and Services"
            fill
            className="object-cover brightness-75"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex items-center">
            <div className="container px-4 md:px-6 text-white">
              <div className="max-w-[800px]">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4">
                  Professional Surveying & Construction Services
                </h1>
                <p className="max-w-[600px] text-white/90 text-base md:text-lg lg:text-xl mb-6">
                  Providing accurate surveying and quality construction services for residential, commercial, and
                  industrial projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground w-full sm:w-auto">
                    <Link href="/services">Our Services</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-black text-black bg-black text-white hover:bg-jl-yellow hover:text-black hover:border-jl-yellow transition-colors w-full sm:w-auto"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Services</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Comprehensive surveying and construction solutions tailored to your needs
              </p>
            </div>
          </div>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No services found. Please add services through the admin dashboard.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
              {services.map((service) => {
                const IconComponent = iconMap[service.icon as keyof typeof iconMap] || MapPin

                return (
                  <Card key={service.id} className="border-2 hover:border-primary transition-colors h-full">
                    <CardHeader>
                      <IconComponent className="h-10 w-10 text-primary" />
                      <CardTitle>{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{service.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Button variant="link" asChild className="px-0">
                        <Link href="/services">Learn more</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Projects</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explore our recent work and successful project deliveries
              </p>
            </div>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No projects found. Please add projects through the admin dashboard.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 sm:h-40 md:h-60 w-full">
                    <Image
                      src={project.image_url || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{project.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" asChild className="px-0">
                      <Link href={`/projects/${project.id}`}>View details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Button asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest News</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stay updated with our latest news and announcements
              </p>
            </div>
          </div>
          {news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news found. Please add news through the admin dashboard.</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
              {news.map((article) => (
                <Card key={article.id} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 sm:h-40 md:h-60 w-full">
                    <Image
                      src={article.image_url || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publish_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" asChild className="px-0">
                      <Link href={`/news/${article.id}`}>Read more</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Button asChild>
              <Link href="/news">View All News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                Ready to Start Your Project?
              </h2>
              <p className="max-w-[900px] text-base md:text-lg lg:text-xl">
                Contact us today for a free consultation and quote
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-background text-foreground border-background hover:bg-background/90 hover:text-primary hover:border-primary w-full"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

