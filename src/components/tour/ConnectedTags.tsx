import { useEffect, useRef, useState } from "react"

import { mineState, screenAnchors } from "@/journey"

/** Tags kept on small screens; the rest would crowd a phone. */
const MAJOR = new Set(["drill", "excavator", "crusher", "plant", "office", "tsf", "dozer"])

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

/** Live labels on every connected asset while MineBook's stop is showing. */
export function ConnectedTags({ show }: { show: boolean }) {
  const [, tick] = useState(0)
  const refs = useRef<Record<string, HTMLDivElement | null>>({})

  // Refresh the text a few times a second (positions update every frame).
  useEffect(() => {
    if (!show) return
    const id = window.setInterval(() => tick((n) => n + 1), 500)
    return () => window.clearInterval(id)
  }, [show])

  useEffect(() => {
    let frame = 0
    const loop = () => {
      frame = requestAnimationFrame(loop)
      // Place each tag above its asset, nudging upward past any tag already
      // placed, so labels never stack on top of each other.
      const placed: { x: number; y: number; w: number; h: number }[] = []
      const items = Object.entries(refs.current)
        .map(([key, el]) => ({ key, el, a: screenAnchors[`mb:${key}`] }))
        .filter((i) => i.el)
        .sort((p, q) => (q.a?.y ?? 0) - (p.a?.y ?? 0))
      for (const { el, a } of items) {
        if (!el) continue
        const visible = show && Boolean(a?.visible)
        el.style.opacity = visible ? "1" : "0"
        if (!a) continue
        const w = el.offsetWidth
        const h = el.offsetHeight
        const x = a.x - w / 2
        let y = a.y - h - 14
        for (let guard = 0; guard < 12; guard++) {
          const hit = placed.find((r) => x < r.x + r.w + 4 && x + w + 4 > r.x && y < r.y + r.h + 3 && y + h + 3 > r.y)
          if (!hit) break
          y = hit.y - h - 4
        }
        if (visible) placed.push({ x, y, w, h })
        el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
        el.style.setProperty("--stem", `${Math.max(0, Math.round(a.y - (y + h)))}px`)
      }
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [show])

  const t = mineState.trucks
  const tags: { key: string; label: string; value: string }[] = [
    { key: "drill", label: "Drill D-01", value: `${mineState.blasts} blasts · 94% avail.` },
    { key: "excavator", label: "Excavator EX-01", value: `${mineState.passes} passes` },
    { key: "loader", label: "Loading DT-105", value: "Being loaded" },
    ...t.map((tr, i) => ({ key: `truck${i}`, label: tr.id, value: tr.payload ? `${tr.state} · ${tr.payload} t` : tr.state })),
    { key: "crusher", label: "Crusher", value: `${fmt(mineState.crusherTph)} t/h` },
    { key: "stockpile", label: "ROM stockpile", value: `${fmt(mineState.stockpile)} t` },
    { key: "plant", label: "Processing plant", value: "Running · 92%" },
    { key: "office", label: "Site office", value: "Shift reports" },
    { key: "workshop", label: "Workshop", value: "DT-107 in service" },
    { key: "fuel", label: "Fuel farm", value: "68% · 182 kL" },
    { key: "tsf", label: "Tailings dam", value: "Freeboard 1.8 m" },
    { key: "dozer", label: "Dozer D10 · Waste dump", value: "Pushing" },
    { key: "water", label: "Water truck", value: "Dust suppression" },
    { key: "comms", label: "Comms tower", value: "LTE · 62 devices" },
    { key: "magazine", label: "Explosives magazine", value: "Secure" },
    { key: "gate", label: "Weighbridge", value: `${mineState.loadsToday} loads today` },
  ]

  return (
    <div className="mb-tags" aria-hidden={!show}>
      {tags.map((tag) => (
        <div
          key={tag.key}
          ref={(el) => (refs.current[tag.key] = el)}
          className={`mb-tag ${MAJOR.has(tag.key) ? "" : "is-minor"}`}
        >
          <strong>{tag.label}</strong>
          <span>{tag.value}</span>
        </div>
      ))}
    </div>
  )
}
