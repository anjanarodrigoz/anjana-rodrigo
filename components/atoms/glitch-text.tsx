"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface GlitchTextProps {
  text: string
  className?: string
}

export function GlitchText({ text, className }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  const handleMouseEnter = () => {
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), 300)
  }

  return (
    <span
      className={cn("relative inline-block cursor-pointer", className)}
      onMouseEnter={handleMouseEnter}
    >
      <span className={cn("relative z-10", isGlitching && "animate-glitch")}>
        {text}
      </span>
      {isGlitching && (
        <>
          <span
            className="absolute left-0 top-0 z-0 text-emerald opacity-70"
            style={{ transform: "translate(-2px, 0)" }}
            aria-hidden="true"
          >
            {text}
          </span>
          <span
            className="absolute left-0 top-0 z-0 text-coral opacity-70"
            style={{ transform: "translate(2px, 0)" }}
            aria-hidden="true"
          >
            {text}
          </span>
        </>
      )}
    </span>
  )
}
