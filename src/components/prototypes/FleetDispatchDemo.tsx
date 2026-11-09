import { useMemo, useRef, useState } from "react"
import { Shuffle } from "lucide-react"

import { Kpi, Segmented, fmt, prefersReducedMotion, useFrame, useInView } from "./ui"

type ShovelId = "S1" | "S2"
type DestId = "CR" | "WD"
type Pt = [number, number]

interface Truck {
  id: string
  shovel: ShovelId
  dest: DestId
  phase: number
}

const NODES: Record<ShovelId | DestId, { pt: Pt; label: string }> = {
  S1: { pt: [92, 96], label: "Shovel 1" },
  S2: { pt: [118, 262], label: "Shovel 2" },
  CR: { pt: [528, 78], label: "Crusher" },
  WD: { pt: [528, 274], label: "Waste dump" },
}

const ROUTES: Record<`${ShovelId}-${DestId}`, Pt[]> = {
  "S1-CR": [[92, 96], [200, 62], [330, 112], [450, 66], [528, 78]],
  "S1-WD": [[92, 96], [200, 62], [300, 182], [430, 232], [528, 274]],
  "S2-CR": [[118, 262], [232, 292], [300, 182], [330, 112], [450, 66], [528, 78]],
  "S2-WD": [[118, 262], [232, 292], [430, 232], [528, 274]],
}

const PAYLOAD = 220 // t
const LOAD_MIN = 2.6 // min per truck at the shovel

const segLengths = (pts: Pt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
const routeLength = (pts: Pt[]) => segLengths(pts).reduce((a, b) => a + b, 0)

const pointAt = (pts: Pt[], f: number): Pt => {
  const lens = segLengths(pts)
  let d = Math.max(0, Math.min(1, f)) * lens.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const t = lens[i] ? d / lens[i] : 0
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]
    }
    d -= lens[i]
  }
  return pts[pts.length - 1]
}

/** Real-world cycle in minutes: load + haul + dump + return, from route length (px → km). */
const cycleMinutes = (shovel: ShovelId, dest: DestId) => {
  const km = routeLength(ROUTES[`${shovel}-${dest}`]) / 320
  return LOAD_MIN + 1.2 + km * 2 * 4.2 + 1.5
}

const truckPosition = (t: Truck): { pt: Pt; stage: string } => {
  const route = ROUTES[`${t.shovel}-${t.dest}`]
  const p = t.phase
  if (p < 0.12) return { pt: route[0], stage: "Loading" }
  if (p < 0.5) return { pt: pointAt(route, (p - 0.12) / 0.38), stage: "Hauling" }
  if (p < 0.58) return { pt: route[route.length - 1], stage: "Dumping" }
  return { pt: pointAt(route, 1 - (p - 0.58) / 0.42), stage: "Returning" }
}

const initial: Truck[] = Array.from({ length: 14 }, (_, i) => ({
  id: `DT-${101 + i}`,
  shovel: i < 8 ? "S1" : "S2",
  dest: i % 3 === 0 ? "WD" : "CR",
  phase: (i * 0.0713) % 1,
}))

export function FleetDispatchDemo() {
  const [trucks, setTrucks] = useState<Truck[]>(initial)
  const [selected, setSelected] = useState<string>("DT-101")
  const [s2Down, setS2Down] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef)
  const animate = !prefersReducedMotion() && inView

  useFrame((dt) => {
    setTrucks((list) =>
      list.map((t) => {
        const down = t.shovel === "S2" && s2Down
        // Trucks at a broken shovel park in the loading bay.
        if (down && t.phase < 0.12) return t
        const seconds = 4 + cycleMinutes(t.shovel, t.dest) * 0.6
        return { ...t, phase: (t.phase + dt / seconds) % 1 }
      }),
    )
  }, animate)

  const shovels = useMemo(() => {
    return (["S1", "S2"] as ShovelId[]).map((id) => {
      const assigned = trucks.filter((t) => t.shovel === id)
      const down = id === "S2" && s2Down
      const avgCycle = assigned.length
        ? assigned.reduce((sum, t) => sum + cycleMinutes(t.shovel, t.dest), 0) / assigned.length
        : cycleMinutes(id, "CR")
      const ideal = avgCycle / LOAD_MIN
      const match = down ? 0 : assigned.length / ideal
      const effective = down ? 0 : Math.min(assigned.length, ideal)
      const tph = (effective * PAYLOAD * 60) / avgCycle
      const status = down
        ? { label: "Shovel down", tone: "bad" as const }
        : match > 1.15
          ? { label: "Over-trucked · queues", tone: "warn" as const }
          : match < 0.85
            ? { label: "Under-trucked · shovel idle", tone: "warn" as const }
            : { label: "Balanced", tone: "ok" as const }
      return { id, assigned: assigned.length, ideal, match, tph, status, down }
    })
  }, [trucks, s2Down])

  const totalTph = shovels.reduce((sum, s) => sum + s.tph, 0)
  const sel = trucks.find((t) => t.id === selected)

  const update = (patch: Partial<Truck>) =>
    setTrucks((list) => list.map((t) => (t.id === selected ? { ...t, ...patch, phase: 0 } : t)))

  // Give each working shovel trucks in proportion to its ideal requirement.
  const autoBalance = () => {
    const live = shovels.filter((s) => !s.down)
    const totalIdeal = live.reduce((sum, s) => sum + s.ideal, 0)
    let cursor = 0
    const quotas = live.map((s) => ({ id: s.id, n: Math.round((s.ideal / totalIdeal) * trucks.length) }))
    const fix = trucks.length - quotas.reduce((a, q) => a + q.n, 0)
    if (quotas.length) quotas[0].n += fix
    setTrucks((list) =>
      list.map((t) => {
        let q = quotas[0]
        let acc = 0
        for (const candidate of quotas) {
          acc += candidate.n
          if (cursor < acc) {
            q = candidate
            break
          }
        }
        cursor += 1
        return q && q.id !== t.shovel ? { ...t, shovel: q.id, phase: 0 } : t
      }),
    )
  }

  return (
    <div className="proto" ref={rootRef}>
      <div className="proto-kpis">
        <Kpi label="Fleet output" value={`${fmt(totalTph)} t/h`} note={`${trucks.length} trucks · ${PAYLOAD} t payload`} />
        {shovels.map((s) => (
          <Kpi
            key={s.id}
            label={NODES[s.id].label}
            value={`${s.assigned} / ${fmt(s.ideal, 1)}`}
            note={`${s.status.label} · MF ${fmt(s.match, 2)}`}
            tone={s.status.tone}
          />
        ))}
      </div>

      <div className="proto-layout">
        <div className="proto-panel">
          <h4>Dispatch {sel ? sel.id : ""}</h4>
          {sel ? (
            <>
              <div className="proto-field">
                <span>Loading unit</span>
                <Segmented
                  label="Loading unit"
                  value={sel.shovel}
                  options={[
                    { value: "S1", label: "Shovel 1" },
                    { value: "S2", label: "Shovel 2" },
                  ]}
                  onChange={(shovel) => update({ shovel })}
                />
              </div>
              <div className="proto-field">
                <span>Destination</span>
                <Segmented
                  label="Destination"
                  value={sel.dest}
                  options={[
                    { value: "CR", label: "Crusher" },
                    { value: "WD", label: "Waste" },
                  ]}
                  onChange={(dest) => update({ dest })}
                />
              </div>
              <p className="proto-note" style={{ marginBottom: 14 }}>
                Cycle {fmt(cycleMinutes(sel.shovel, sel.dest), 1)} min · {truckPosition(sel).stage}
              </p>
            </>
          ) : null}
          <div className="proto-row">
            <button className="proto-btn" type="button" onClick={autoBalance}>
              <Shuffle aria-hidden="true" />
              Auto-balance
            </button>
            <button className="proto-btn is-ghost" type="button" onClick={() => setS2Down((d) => !d)}>
              {s2Down ? "Repair Shovel 2" : "Break down Shovel 2"}
            </button>
          </div>
          <p className="proto-note" style={{ marginTop: 12 }}>
            Ideal trucks = cycle ÷ {LOAD_MIN} min load time. Match factor (MF) near 1.0 keeps shovels busy without
            queues.
          </p>
        </div>

        <div className="proto-panel">
          <h4>Live haul map · click a truck</h4>
          <svg className="proto-svg" viewBox="0 0 600 340" role="img" aria-label="Haul road map with trucks">
            {[0, 1, 2, 3].map((k) => (
              <ellipse
                key={k}
                cx="110"
                cy="180"
                rx={70 + k * 22}
                ry={140 + k * 14}
                fill="none"
                stroke="rgba(11,95,224,.12)"
              />
            ))}
            {Object.values(ROUTES).map((pts, i) => (
              <polyline
                key={i}
                points={pts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="#cfd8e6"
                strokeWidth="9"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {sel ? (
              <polyline
                points={ROUTES[`${sel.shovel}-${sel.dest}`].map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="var(--blue)"
                strokeWidth="3"
                strokeDasharray="7 6"
                strokeLinejoin="round"
              />
            ) : null}
            {(Object.keys(NODES) as (keyof typeof NODES)[]).map((id) => {
              const n = NODES[id]
              const isDown = id === "S2" && s2Down
              return (
                <g key={id} transform={`translate(${n.pt[0]} ${n.pt[1]})`}>
                  <rect x="-15" y="-15" width="30" height="30" rx="8" fill={isDown ? "#c42b2b" : "#0f1d33"} />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
                    {id}
                  </text>
                  <text y={id === "CR" ? -22 : 30} textAnchor="middle" fontSize="11" fill="#4d5868">
                    {n.label}
                    {isDown ? " (down)" : ""}
                  </text>
                </g>
              )
            })}
            {trucks.map((t) => {
              const { pt } = truckPosition(t)
              const active = t.id === selected
              return (
                <g
                  key={t.id}
                  transform={`translate(${pt[0]} ${pt[1]})`}
                  onClick={() => setSelected(t.id)}
                  style={{ cursor: "pointer" }}
                >
                  <circle r={active ? 9 : 7} fill={active ? "var(--blue)" : "#fff"} stroke="var(--blue)" strokeWidth="2.5" />
                  {active ? (
                    <text y="-13" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--blue-strong)">
                      {t.id}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>
          <div className="proto-row" style={{ marginTop: 10 }}>
            {trucks.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`proto-pill ${t.id === selected ? "is-accent" : ""}`}
                onClick={() => setSelected(t.id)}
              >
                {t.id} · {t.shovel}→{t.dest === "CR" ? "CR" : "WD"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
