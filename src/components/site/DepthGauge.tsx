import { useEffect, useState } from "react"

import { readJourney, stages, type StageId } from "@/journey"
import { cn } from "@/lib/utils"

/** Fixed side gauge: where you are in the mine, and a way to jump between stages. */
export function DepthGauge() {
  const [active, setActive] = useState<StageId>("surface")

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

  const go = (id: StageId) => {
    document.querySelector(`[data-stage="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const current = stages.find((s) => s.id === active) ?? stages[0]

  return (
    <nav className="depth-gauge" aria-label="Mine stages">
      <p className="depth-readout" aria-live="polite">
        <span>{current.rl}</span>
        {current.label}
      </p>
      <ol>
        {stages.map((stage) => (
          <li key={stage.id}>
            <button
              type="button"
              className={cn(stage.id === active && "is-active")}
              aria-current={stage.id === active ? "step" : undefined}
              onClick={() => go(stage.id)}
            >
              <i aria-hidden="true" />
              <span>{stage.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
