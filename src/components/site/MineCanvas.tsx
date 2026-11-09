import { useEffect, useRef, useState } from "react"

import { readJourney } from "@/journey"
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
 * Hosts the three.js mine, fixed behind the whole page. Scrolling moves the
 * camera through the mine's stages (see journey.ts). three.js is loaded on
 * demand so the first paint never waits on it; without WebGL the page is
 * simply white.
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

    let queued = 0
    const onScroll = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        if (!handle) return
        const j = readJourney()
        handle.setJourney(j.from, j.to, j.t)
      })
    }

    import("@/three/mineScene")
      .then(({ createMineScene }) => {
        if (cancelled) return
        handle = createMineScene(canvas, { still })
        setReady(true)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
      })
      .catch(() => {
        /* Static backdrop remains — the scene is decoration, not content. */
      })

    return () => {
      cancelled = true
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(queued)
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
