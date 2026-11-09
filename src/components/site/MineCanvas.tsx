import { useEffect, useRef, useState } from "react"

import type { MineSceneHandle } from "@/three/mineScene"

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

/**
 * Hosts the three.js open-pit scene. three.js is loaded on demand so the first
 * paint of the page never waits on it; without WebGL the hero keeps its static
 * contour backdrop.
 */
export function MineCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !supportsWebGL()) return

    let handle: MineSceneHandle | null = null
    let cancelled = false
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const onScroll = () => {
      const hero = canvas.parentElement
      if (!hero || !handle) return
      handle.setScroll(window.scrollY / Math.max(1, hero.offsetHeight))
    }

    import("@/three/mineScene")
      .then(({ createMineScene }) => {
        if (cancelled) return
        handle = createMineScene(canvas, { still })
        setReady(true)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
      })
      .catch(() => {
        /* Static backdrop remains — the scene is decoration, not content. */
      })

    return () => {
      cancelled = true
      window.removeEventListener("scroll", onScroll)
      handle?.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`${className ?? ""} ${ready ? "is-ready" : ""}`}
      aria-hidden="true"
    />
  )
}
