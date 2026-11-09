import { useEffect } from "react"

import { IslandCanvas } from "@/components/tour/IslandCanvas"
import { StopCards } from "@/components/tour/StopCards"
import { TourRail } from "@/components/tour/TourRail"
import { useActiveStage } from "@/components/tour/useActiveStage"
import { stages, type StageId } from "@/journey"

/** The full-screen mine. Scrolling walks Anjana from stop to stop. */
export function TourPage({ stage }: { stage?: StageId }) {
  const active = useActiveStage()

  // Arriving back from a detail page: jump straight to that stop.
  useEffect(() => {
    const el = stage ? document.querySelector(`[data-stage="${stage}"]`) : null
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" })
    else window.scrollTo({ top: 0, behavior: "instant" })
  }, [stage])

  const goContact = () =>
    document.querySelector('[data-stage="gate"]')?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <>
      <IslandCanvas />

      <header className="topbar">
        <a className="brand" href="#/" aria-label="Anjana Rodrigo — start of the tour">
          <img src="/assets/brand/ar-logo.png" alt="" width="30" height="30" />
          <span>Anjana Rodrigo</span>
        </a>
        <button className="pill pill-solid" type="button" onClick={goContact}>
          Let&apos;s talk
        </button>
      </header>

      <TourRail active={active} />
      <StopCards active={active} />

      {/* Invisible scroll track: one screen per stop drives the walk. */}
      <main className="track">
        {stages.map((s) => (
          <section key={s.id} className="track-stop" data-stage={s.id} aria-label={s.label} />
        ))}
      </main>
    </>
  )
}
