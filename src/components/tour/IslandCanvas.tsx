import { useEffect, useRef, useState } from "react"

import { readJourney } from "@/journey"
import type { IslandHandle } from "@/three/islandScene"

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

/**
 * The floating-island mine, fixed behind the whole page. Scrolling moves the
 * camera and walks the guide between tour stops. three.js loads on demand so
 * the page never waits for it; without WebGL the page is simply white.
 */
export function IslandCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !supportsWebGL()) return

    let handle: IslandHandle | null = null
    let cancelled = false
    let queued = 0
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const sync = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        if (!handle) return
        const j = readJourney()
        handle.setJourney(j.from, j.to, j.t)
      })
    }

    import("@/three/islandScene")
      .then(({ createIslandScene }) => {
        if (cancelled) return
        handle = createIslandScene(canvas, { still })
        setReady(true)
        sync()
        window.addEventListener("scroll", sync, { passive: true })
        window.addEventListener("resize", sync)
      })
      .catch(() => {
        /* The scene is decoration; the page works without it. */
      })

    return () => {
      cancelled = true
      window.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
      cancelAnimationFrame(queued)
      handle?.dispose()
    }
  }, [])

  return <canvas ref={ref} className={`island-canvas ${ready ? "is-ready" : ""}`} aria-hidden="true" />
}
