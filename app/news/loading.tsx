import { SkeletonBanner, SkeletonGrid } from "@/components/ui/skeleton-loader"

export default function NewsLoading() {
  return (
    <div className="container py-12 md:py-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2 w-full max-w-[900px]">
          <SkeletonBanner />
        </div>
      </div>

      <div className="mt-12">
        <SkeletonGrid count={6} />
      </div>
    </div>
  )
}

