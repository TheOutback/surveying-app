import type React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "small" | "large" | "full"
}

export function Container({ children, className, size = "default" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 md:px-6",
        {
          "max-w-screen-xl": size === "default",
          "max-w-screen-lg": size === "small",
          "max-w-screen-2xl": size === "large",
          "w-full": size === "full",
        },
        className,
      )}
    >
      {children}
    </div>
  )
}

