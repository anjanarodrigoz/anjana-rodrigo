import { useEffect, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import type { StageId } from "@/journey"
import { href } from "@/router"

/** Plain white page layout for detail pages, with a way back into the mine. */
export function PageShell({ back, backLabel, children }: { back?: StageId; backLabel: string; children: ReactNode }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  return (
    <div className="page">
      <header className="page-bar">
        <a className="pill" href={href.tour(back)}>
          <ArrowLeft aria-hidden="true" />
          {backLabel}
        </a>
        <a className="brand" href="#/">
          <img src="/assets/brand/ar-logo.png" alt="" width="30" height="30" />
          <span>Anjana Rodrigo</span>
        </a>
      </header>
      <main className="page-main">{children}</main>
      <footer className="page-foot">
        <span>© 2026 Anjana Rodrigo</span>
        <span>Mining engineering · Software</span>
      </footer>
    </div>
  )
}
