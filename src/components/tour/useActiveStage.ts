import { useEffect, useState } from "react"

import { readJourney, type StageId } from "@/journey"

/** The tour stop currently being read. */
export function useActiveStage() {
  const [active, setActive] = useState<StageId>("welcome")

  useEffect(() => {
    let queued = 0
    const onScroll = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        setActive(readJourney().active)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(queued)
    }
  }, [])

  return active
}
