import type { ElementType, ReactNode } from "react"

import { useReveal } from "@/hooks"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger index — each step delays the reveal by 70ms. */
  step?: number
  as?: ElementType
}

/** Fades and lifts its children into place once, on first scroll into view. */
export function Reveal({ children, className, step = 0, as: Tag = "div" }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <Tag
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={step ? { transitionDelay: `${step * 70}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
