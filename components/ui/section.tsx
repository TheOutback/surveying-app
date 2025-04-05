import type React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"

interface SectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  containerSize?: "default" | "small" | "large" | "full"
  id?: string
}

export function Section({ children, className, containerClassName, containerSize = "default", id }: SectionProps) {
  return (
    <section id={id} className={cn("py-12 md:py-16 lg:py-24", className)}>
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </section>
  )
}

