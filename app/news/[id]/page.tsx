import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { NewsArticle } from "@/lib/supabase"

// Add this export to make the page dynamic
export const dynamic = "force-dynamic"

async function getNewsArticle(id: string) {
  try {
    const { data, error } = await supabase.from("news").select("*").eq("id", Number.parseInt(id)).single()

    if (error) {
      console.error("Error fetching news article:", error)
      return null
    }

    return data as NewsArticle
  } catch (error) {
    console.error("Error fetching news article:", error)
    return null
  }
}

// Generate static params for all news articles
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("news").select("id")
    return (data || []).map((article) => ({
      id: article.id.toString(),
    }))
  } catch (error) {
    return []
  }
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const article = await getNewsArticle(params.id)

  if (!article) {
    // If article doesn't exist, use a default article for demo purposes
    const defaultArticle = {
      id: Number.parseInt(params.id),
      title: "Sample News Article",
      description: "This is a sample news article description for demonstration purposes.",
      content:
        "<p>This is the full content of the news article. It includes detailed information about the news topic.</p><p>The article covers various aspects of the topic and provides valuable insights.</p>",
      image_url: "/placeholder.svg?height=400&width=800",
      author: "John Doe",
      publish_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    return (
      <div className="container py-12 md:py-24">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/news" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{defaultArticle.title}</h1>

            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(defaultArticle.publish_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{defaultArticle.author}</span>
              </div>
            </div>

            <div className="relative h-64 sm:h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={defaultArticle.image_url || "/placeholder.svg"}
                alt={defaultArticle.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
                priority
              />
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-muted-foreground">{defaultArticle.description}</p>
              <div className="mt-6" dangerouslySetInnerHTML={{ __html: defaultArticle.content || "" }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/news" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{article.title}</h1>

          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(article.publish_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{article.author}</span>
            </div>
          </div>

          <div className="relative h-64 sm:h-96 w-full rounded-lg overflow-hidden">
            <Image
              src={article.image_url || "/placeholder.svg?height=400&width=800"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
              priority
            />
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground">{article.description}</p>
            <div className="mt-6" dangerouslySetInnerHTML={{ __html: article.content || "" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

