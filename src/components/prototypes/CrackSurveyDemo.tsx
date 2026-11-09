import { useRef, useState, type PointerEvent } from "react"
import { UploadCloud, Trash2, WifiOff } from "lucide-react"

import { Kpi, Slider, fmt } from "./ui"

type Pt = [number, number]
type Sync = "pending" | "syncing" | "synced"

interface Crack {
  id: number
  points: Pt[]
  width: number // mm
  sync: Sync
}

const PX_PER_M = 100 // wall drawing is 6.0 m × 3.4 m

const classify = (width: number) =>
  width < 0.3
    ? { label: "Hairline", tone: "ok" as const, action: "Record only" }
    : width < 1
      ? { label: "Fine", tone: "ok" as const, action: "Monitor monthly" }
      : width < 5
        ? { label: "Moderate", tone: "warn" as const, action: "Inspect & seal" }
        : { label: "Severe", tone: "bad" as const, action: "Engineer review" }

const lengthM = (pts: Pt[]) =>
  pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0) / PX_PER_M

const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")

const SEED: Crack[] = [
  {
    id: 1,
    points: [[120, 60], [138, 92], [131, 128], [152, 170], [148, 214]],
    width: 2.4,
    sync: "synced",
  },
]

export function CrackSurveyDemo() {
  const [cracks, setCracks] = useState<Crack[]>(SEED)
  const [draft, setDraft] = useState<Pt[] | null>(null)
  const [selected, setSelected] = useState<number | null>(1)
  const [offline, setOffline] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const nextId = useRef(2)

  const toSvg = (event: PointerEvent): Pt => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    return [Math.max(0, Math.min(600, p.x)), Math.max(0, Math.min(340, p.y))]
  }

  const onDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraft([toSvg(event)])
  }

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!draft) return
    const p = toSvg(event)
    const last = draft[draft.length - 1]
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 6) setDraft([...draft, p])
  }

  const onUp = () => {
    if (draft && lengthM(draft) > 0.15) {
      const id = nextId.current++
      setCracks((list) => [...list, { id, points: draft, width: 0.6, sync: "pending" }])
      setSelected(id)
    }
    setDraft(null)
  }

  const update = (id: number, patch: Partial<Crack>) =>
    setCracks((list) => list.map((c) => (c.id === id ? { ...c, ...patch, sync: patch.sync ?? "pending" } : c)))

  const syncAll = () => {
    const ids = cracks.filter((c) => c.sync === "pending").map((c) => c.id)
    setCracks((list) => list.map((c) => (ids.includes(c.id) ? { ...c, sync: "syncing" } : c)))
    window.setTimeout(
      () => setCracks((list) => list.map((c) => (ids.includes(c.id) ? { ...c, sync: "synced" } : c))),
      900,
    )
  }

  const sel = cracks.find((c) => c.id === selected)
  const pending = cracks.filter((c) => c.sync === "pending").length
  const worst = cracks.reduce((max, c) => Math.max(max, c.width), 0)

  return (
    <div className="proto">
      <div className="proto-kpis">
        <Kpi label="Cracks recorded" value={cracks.length} />
        <Kpi label="Total length" value={`${fmt(cracks.reduce((s, c) => s + lengthM(c.points), 0), 2)} m`} />
        <Kpi label="Worst width" value={`${fmt(worst, 1)} mm`} note={classify(worst).label} tone={classify(worst).tone} />
        <Kpi
          label="Sync queue"
          value={pending}
          note={offline ? "Offline — stored on device" : pending ? "Ready to upload" : "All synced"}
          tone={pending ? "warn" : "ok"}
        />
      </div>

      <div className="proto-layout">
        <div className="proto-panel">
          <h4>{sel ? `Crack C-${String(sel.id).padStart(3, "0")}` : "Select a crack"}</h4>
          {sel ? (
            <>
              <Slider
                label="Measured width"
                value={sel.width}
                onChange={(width) => update(sel.id, { width })}
                min={0.1}
                max={10}
                step={0.1}
                unit=" mm"
              />
              <ul className="proto-checks" style={{ marginBottom: 14 }}>
                <li>
                  <i />
                  Length {fmt(lengthM(sel.points), 2)} m
                </li>
                <li className={`is-${classify(sel.width).tone}`}>
                  <i />
                  {classify(sel.width).label} → {classify(sel.width).action}
                </li>
              </ul>
              <button
                className="proto-btn is-ghost"
                type="button"
                onClick={() => {
                  setCracks((list) => list.filter((c) => c.id !== sel.id))
                  setSelected(null)
                }}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </button>
            </>
          ) : (
            <p className="proto-note">Draw on the wall to log a new crack.</p>
          )}

          <h4 style={{ marginTop: 20 }}>Field sync</h4>
          <div className="proto-row">
            <button className="proto-btn" type="button" onClick={syncAll} disabled={offline || !pending}>
              <UploadCloud aria-hidden="true" />
              Sync {pending || ""}
            </button>
            <button className="proto-btn is-ghost" type="button" onClick={() => setOffline((o) => !o)}>
              <WifiOff aria-hidden="true" />
              {offline ? "Go online" : "Go offline"}
            </button>
          </div>
        </div>

        <div className="proto-panel">
          <div className="proto-spread">
            <h4>Wall elevation · drag to trace a crack</h4>
            <span className="proto-note">Grid = 1 m</span>
          </div>
          <svg
            ref={svgRef}
            className="proto-svg"
            viewBox="0 0 600 340"
            role="img"
            aria-label="Wall elevation for tracing cracks"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => setDraft(null)}
            style={{ cursor: "crosshair", background: "#eef0f3" }}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`v${i}`} x1={i * 100} x2={i * 100} y1="0" y2="340" stroke="rgba(0,0,0,.07)" />
            ))}
            {Array.from({ length: 4 }, (_, i) => (
              <line key={`h${i}`} x1="0" x2="600" y1={i * 100} y2={i * 100} stroke="rgba(0,0,0,.07)" />
            ))}
            {cracks.map((c) => {
              const tone = classify(c.width).tone
              const color = tone === "bad" ? "#c42b2b" : tone === "warn" ? "#b25e00" : "#1d2b45"
              return (
                <g key={c.id} onPointerDown={(e) => (e.stopPropagation(), setSelected(c.id))} style={{ cursor: "pointer" }}>
                  <path d={toPath(c.points)} fill="none" stroke="transparent" strokeWidth="16" />
                  <path
                    d={toPath(c.points)}
                    fill="none"
                    stroke={color}
                    strokeWidth={1 + Math.min(c.width, 8) * 0.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {c.id === selected ? (
                    <path d={toPath(c.points)} fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeDasharray="4 4" transform="translate(6 0)" />
                  ) : null}
                  <text x={c.points[0][0] + 8} y={c.points[0][1] - 6} fontSize="11" fontWeight="700" fill={color}>
                    C-{String(c.id).padStart(3, "0")}
                  </text>
                </g>
              )
            })}
            {draft ? <path d={toPath(draft)} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" /> : null}
          </svg>

          <div className="proto-scroll" style={{ marginTop: 10 }}>
            <table className="proto-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Length</th>
                  <th>Width</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cracks.map((c) => (
                  <tr key={c.id} className={c.id === selected ? "is-selected" : undefined} onClick={() => setSelected(c.id)}>
                    <td>C-{String(c.id).padStart(3, "0")}</td>
                    <td>{fmt(lengthM(c.points), 2)} m</td>
                    <td>{fmt(c.width, 1)} mm</td>
                    <td>
                      <span className={`proto-pill is-${classify(c.width).tone}`}>{classify(c.width).label}</span>
                    </td>
                    <td>
                      <span className={`proto-pill ${c.sync === "synced" ? "is-ok" : c.sync === "syncing" ? "is-accent" : "is-warn"}`}>
                        {c.sync === "synced" ? "Synced" : c.sync === "syncing" ? "Syncing…" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
