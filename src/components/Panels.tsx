"use client"

import { ArrowUpRight, X } from "lucide-react"

import { minebook, research } from "@/lib/content"
import { useWorld } from "@/lib/store"

/** Small information panels opened by clicking objects in the 3D world. */

export function Panels() {
  const panel = useWorld((s) => s.panel)
  const set = useWorld((s) => s.set)
  if (!panel) return null

  let tag = ""
  let title = ""
  let body: React.ReactNode = null

  if (panel.kind === "equipment") {
    tag = "MineBook | Equipment"
    title = "Every machine, its shift and its downtime"
    body = (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {["Operating", "Standby", "Down"].map((s, i) => (
            <div key={s} className="rounded-lg bg-forest/5 py-2">
              <div className={`mx-auto mb-1 h-2 w-2 rounded-full ${["bg-forest", "bg-sage", "bg-[#b5483f]"][i]}`} />
              {s}
            </div>
          ))}
        </div>
        <p>Log equipment against shifts, record downtime with reasons, and see availability without a spreadsheet.</p>
      </div>
    )
  } else if (panel.kind === "workforce") {
    tag = "MineBook | Workforce and shifts"
    title = "Who is on site, on which shift"
    body = (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {["Day shift", "Night shift"].map((s) => (
            <div key={s} className="rounded-lg border border-forest/15 p-2">
              <div className="mb-2 font-medium text-charcoal">{s}</div>
              <div className="flex -space-x-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-5 w-5 rounded-full border-2 border-paper bg-sage" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p>Onboard a site, assign people to shifts, and turn the shift log into the daily report.</p>
      </div>
    )
  } else if (panel.kind === "planning") {
    tag = "MineBook | Planning"
    title = "Plan on the map, then test the plan"
    body = (
      <div className="space-y-3">
        <svg viewBox="0 0 220 110" className="w-full rounded-lg bg-[#e9e6dc]" role="img" aria-label="Map preview with a planned block">
          {[0, 1, 2, 3].map((k) => (
            <ellipse key={k} cx="110" cy="58" rx={96 - k * 20} ry={46 - k * 10} fill="none" stroke="#183F35" strokeOpacity="0.25" />
          ))}
          <polygon points="60,34 118,26 130,52 70,60" fill="#183F35" fillOpacity="0.18" stroke="#183F35" strokeWidth="1.5" strokeDasharray="4 3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={74 + i * 11} cy={44 - i * 1.5} r="2" fill="#183F35" />
          ))}
        </svg>
        <p>Mark out blocks on the pit map and run planning experiments before committing equipment.</p>
      </div>
    )
  } else if (panel.kind === "project") {
    tag = panel.project.meta
    title = panel.project.title
    body = (
      <div className="space-y-3">
        {/* The real product, in a device frame */}
        <div className="overflow-hidden rounded-xl border border-charcoal/15 bg-white shadow-sm">
          {panel.project.device === "web" ? (
            <div className="flex items-center gap-1.5 border-b border-charcoal/10 bg-charcoal/5 px-3 py-1.5">
              <i className="h-2 w-2 rounded-full bg-charcoal/20" />
              <i className="h-2 w-2 rounded-full bg-charcoal/20" />
              <i className="h-2 w-2 rounded-full bg-charcoal/20" />
              <span className="ml-2 truncate rounded-full bg-white px-2 py-0.5 text-[10px] text-charcoal/60">{panel.project.url?.replace(/^https?:\/\/|\/$/g, "") ?? panel.project.title}</span>
            </div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={panel.project.image} alt={`${panel.project.title} screens`} className="block w-full" />
        </div>
        <p>{panel.project.line}</p>
        {panel.project.url ? (
          <a href={panel.project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper">
            Open the live site <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    )
  } else if (panel.kind === "role") {
    tag = `${panel.role.org} | ${panel.role.period}`
    title = panel.role.role
    body = <p>{panel.role.line}</p>
  } else if (panel.kind === "paper") {
    tag = research.detail
    title = research.title
    body = (
      <div className="space-y-2">
        <p className="text-xs">
          {research.authors.map((a, i) => (
            <span key={a} className={a === research.me ? "font-semibold text-forest" : ""}>
              {a}
              {i < research.authors.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
        <p className="text-xs text-charcoal/60">{research.venue}</p>
        <p>{research.line}</p>
      </div>
    )
  }

  return (
    <aside
      data-ui
      aria-live="polite"
      className="fixed bottom-36 left-4 right-4 z-40 max-h-[50vh] overflow-auto rounded-2xl border border-white/60 bg-paper/90 p-5 text-sm text-charcoal/80 shadow-2xl backdrop-blur-md sm:bottom-auto sm:left-auto sm:right-36 sm:top-20 sm:w-[440px]"
    >
      <button type="button" onClick={() => set({ panel: null })} className="absolute right-3 top-3 rounded-full p-1.5 text-charcoal/60 hover:bg-forest/10" aria-label="Close">
        <X className="h-4 w-4" />
      </button>
      <p className="mb-1 pr-8 text-[11px] font-semibold uppercase tracking-wider text-forest">{tag}</p>
      <h3 className="mb-3 pr-6 font-display text-lg font-semibold leading-snug text-charcoal">{title}</h3>
      {body}
      {panel.kind === "paper" ? (
        <a href={research.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper">
          Read on IEEE Xplore <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      ) : null}
      {panel.kind === "equipment" || panel.kind === "workforce" || panel.kind === "planning" ? (
        <a href={minebook.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper">
          Open minebook.lk <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </aside>
  )
}
