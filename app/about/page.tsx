import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Award, Users, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { TeamMember } from "@/lib/supabase"

// Update the getTeamMembers function to use dynamic data fetching
async function getTeamMembers() {
  const { data, error } = await supabase.from("team").select("*")

  if (error) {
    console.error("Error fetching team members:", error)
    return []
  }

  return data as TeamMember[]
}

// Add this export to make the page dynamic
export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About Us</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Learn more about JL Surveying & Services and our commitment to excellence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            JL Surveying & Services was founded in 2005 with a vision to provide high-quality surveying and construction
            services to clients across the region. What started as a small team of dedicated professionals has grown
            into a full-service company with a reputation for excellence and reliability.
          </p>
          <p className="text-muted-foreground">
            Over the years, we have expanded our services to include a comprehensive range of surveying and construction
            solutions, always maintaining our commitment to accuracy, quality, and customer satisfaction.
          </p>
          <p className="text-muted-foreground">
            Today, JL Surveying & Services is proud to be a trusted partner for clients in various sectors, including
            residential, commercial, and industrial. Our team of experienced professionals continues to uphold the
            values that have guided us from the beginning: integrity, expertise, and dedication.
          </p>
        </div>
        <div className="relative h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0097-S3CO64i3zCaWoGlcpqoEUMIpt09mH7.jpeg"
            alt="About Us"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              icon: CheckCircle,
              title: "Quality",
              description: "We are committed to delivering the highest quality services and results for every project.",
            },
            {
              icon: Award,
              title: "Expertise",
              description:
                "Our team consists of experienced professionals with extensive knowledge in surveying and construction.",
            },
            {
              icon: Users,
              title: "Client Focus",
              description: "We prioritize our clients' needs and work closely with them to ensure satisfaction.",
            },
            {
              icon: Clock,
              title: "Timeliness",
              description: "We understand the importance of deadlines and strive to complete projects on time.",
            },
          ].map((item, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <item.icon className="h-8 w-8 text-primary shrink-0" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Our Team</h2>
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No team members found. Please add team members through the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="h-full flex flex-col">
                <div className="relative h-48 sm:h-56 w-full">
                  <Image
                    src={member.image_url || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.position}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

