"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ResponsiveImageProps {
  src: string
  alt: string
  aspectRatio?: "square" | "video" | "wide" | "auto"
  width?: number
  height?: number
  fill?: boolean
  className?: string
  containerClassName?: string
  priority?: boolean
  sizes?: string
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = "auto",
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Define aspect ratio classes
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    auto: "",
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md",
        aspectRatio !== "auto" && aspectRatioClasses[aspectRatio],
        fill && "relative h-full w-full",
        containerClassName,
      )}
    >
      {isLoading && (
        <Skeleton className={cn("absolute inset-0 z-10", aspectRatio !== "auto" && aspectRatioClasses[aspectRatio])} />
      )}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={cn("object-cover transition-all", isLoading ? "scale-110 blur-md" : "scale-100 blur-0", className)}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        sizes={sizes}
      />
    </div>
  )
}

