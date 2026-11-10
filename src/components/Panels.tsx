"use client"

import { ArrowUpRight, X } from "lucide-react"

import { crackSurvey, minebook, research } from "@/lib/content"
import { useWorld } from "@/lib/store"

/** Small information panels opened by clicking objects in the 3D world. */

function CrackPhoto({ seed, width }: { seed: number; width: number }) {
  // Illustrative close-up drawn from the record, standing in for a site photo.
  let s = seed * 9301 + 49297
  const rnd = () => ((s = (s * 9301 + 49297) % 233280), s / 233280)
  let x = 90 + rnd() * 30
  let d = `M ${x} 6`
  for (let y = 18; y < 150; y += 12) {
    x += (rnd() - 0.5) * 22
    d += ` L ${x.toFixed(1)} ${y}`
  }
  return (
    <svg viewBox="0 0 220 150" className="w-full rounded-lg" role="img" aria-label="Illustrative close-up of the crack">
      <rect width="220" height="150" fill="#e9e2d5" />
      <path d={d} fill="none" stroke="#2a2622" strokeWidth={0.8 + width} strokeLinecap="round" strokeLinejoin="round" />
      <g stroke="#183F35" strokeWidth="1">
        <line x1="150" y1="130" x2="200" y2="130" />
        <line x1="150" y1="126" x2="150" y2="134" />
        <line x1="200" y1="126" x2="200" y2="134" />
      </g>
      <text x="175" y="122" textAnchor="middle" fontSize="9" fill="#183F35">
        10 mm
      </text>
    </svg>
  )
}

export function Panels() {
  const panel = useWorld((s) => s.panel)
  const phase = useWorld((s) => s.phase)
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
    body = <p>{panel.project.line}</p>
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
  } else if (panel.kind === "crack") {
    const rec = crackSurvey.records.find((r) => r.id === panel.id)!
    const index = crackSurvey.records.indexOf(rec)
    const grew = rec.after - rec.before
    tag = `Survey record ${rec.id} | Sample`
    title = rec.wall
    body = (
      <div className="space-y-3">
        <CrackPhoto seed={index + 1} width={phase === "before" ? rec.before : rec.after} />
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 90 65" className="w-24 shrink-0 rounded bg-white" role="img" aria-label="Location on the floor plan">
            <rect x="2" y="2" width="86" height="61" fill="none" stroke="#102C25" strokeWidth="2" />
            <path d="M45 2V25M2 32H38M52 32H88M45 40V63" stroke="#102C25" strokeWidth="1.2" />
            <circle cx={2 + rec.plan[0] * 86} cy={2 + (1 - rec.plan[1]) * 61} r="4" fill="#b5483f" />
          </svg>
          <dl className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <dt className="text-charcoal/60">Room</dt>
            <dd>{rec.room}</dd>
            <dt className="text-charcoal/60">Before</dt>
            <dd>{rec.before.toFixed(1)} mm</dd>
            <dt className="text-charcoal/60">After</dt>
            <dd>{rec.after.toFixed(1)} mm</dd>
            <dt className="text-charcoal/60">Change</dt>
            <dd className={grew > 0.3 ? "font-semibold text-[#b5483f]" : ""}>{grew > 0 ? `+${grew.toFixed(1)} mm` : "No change"}</dd>
          </dl>
        </div>
      </div>
    )
  }

  return (
    <aside
      data-ui
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-40 max-h-[60vh] overflow-auto rounded-2xl border border-white/60 bg-paper/90 p-5 text-sm text-charcoal/80 shadow-2xl backdrop-blur-md sm:bottom-auto sm:left-auto sm:right-8 sm:top-24 sm:w-[340px]"
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
