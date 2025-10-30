"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  delay?: number
}

export function TypewriterText({
  text,
  className,
  speed = 100,
  delay = 0,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started || currentIndex >= text.length) return

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text[currentIndex])
      setCurrentIndex((prev) => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [currentIndex, text, speed, started])

  return (
    <span className={cn("inline-block", className)}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}
