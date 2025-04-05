import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { NewsArticle } from "@/lib/supabase"

// Update the getNewsArticles function to use dynamic data fetching
async function getNewsArticles() {
  const { data, error } = await supabase.from("news").select("*").order("publish_date", { ascending: false })

  if (error) {
    console.error("Error fetching news articles:", error)
    return []
  }

  return data as NewsArticle[]
}

// Add this export to make the page dynamic
export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const articles = await getNewsArticles()

  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Latest News</h1>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Stay updated with the latest news and developments from JL Surveying & Services
          </p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No news articles found. Please add news articles through the admin dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-12">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden h-full flex flex-col">
              <div className="relative h-40 sm:h-48 w-full">
                <Image
                  src={article.image_url || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pb-2">
                <CardDescription className="text-base mb-4 line-clamp-3">{article.description}</CardDescription>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{new Date(article.publish_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{article.author}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/news/${article.id}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

