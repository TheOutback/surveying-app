import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonCardProps {
  imageHeight?: string
  hasImage?: boolean
  hasFooter?: boolean
}

export function SkeletonCard({ imageHeight = "h-48", hasImage = true, hasFooter = true }: SkeletonCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {hasImage && (
        <div className={`w-full ${imageHeight}`}>
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <div className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {hasFooter && (
          <div className="pt-4 mt-4 border-t">
            <Skeleton className="h-9 w-full sm:w-32" />
          </div>
        )}
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6, columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid ${columns} gap-4 md:gap-6`}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[160px]" />
            </div>
          </div>
        ))}
    </div>
  )
}

export function SkeletonBanner() {
  return (
    <div className="w-full space-y-5">
      <Skeleton className="h-12 w-3/4 sm:w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Skeleton className="h-10 w-full sm:w-32" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>
    </div>
  )
}

