import { useMemo, useRef, useState } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"

import { Kpi, Segmented, fmt, prefersReducedMotion, useInView, useInterval } from "./ui"

type Shift = "Day" | "Night"
type View = "overview" | "fleet" | "alerts"
type TruckState = "Loading" | "Hauling" | "Spotting" | "Queuing" | "Down"

interface Alert {
  id: number
  minute: number
  title: string
  area: string
  severity: "bad" | "warn" | "info"
}

interface Truck {
  id: string
  state: TruckState
  payload: number
}

const STEPS = 72 // 12-hour shift in 10-minute steps
const PLAN: Record<Shift, number> = { Day: 80000, Night: 72000 }
const FLEET = 62
const STATES: TruckState[] = ["Loading", "Hauling", "Spotting", "Queuing"]

const ALERT_POOL: Omit<Alert, "id" | "minute">[] = [
  { title: "Engine temperature high", area: "North Pit · EX-202", severity: "bad" },
  { title: "Haul road congestion", area: "Ramp 3", severity: "warn" },
  { title: "Overdue for service", area: "Workshop · DT-103", severity: "warn" },
  { title: "Queue at crusher > 4 trucks", area: "Primary crusher", severity: "warn" },
  { title: "Blast clearance in 30 min", area: "Bench 6 · Pushback 2", severity: "info" },
  { title: "Tyre pressure low", area: "South Pit · DT-117", severity: "bad" },
  { title: "Light rain — reduce speed", area: "All haul roads", severity: "info" },
]

const clock = (shift: Shift, minute: number) => {
  const start = shift === "Day" ? 6 * 60 : 18 * 60
  const total = (start + minute) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

const freshTrucks = (): Truck[] =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `DT-${101 + i}`,
    state: STATES[i % 4],
    payload: 205 + ((i * 7) % 20),
  }))

export function MineBookDemo() {
  const [view, setView] = useState<View>("overview")
  const [shift, setShift] = useState<Shift>("Day")
  const [running, setRunning] = useState(() => !prefersReducedMotion())
  const [actual, setActual] = useState<number[]>([0])
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, minute: 0, ...ALERT_POOL[1] },
    { id: 2, minute: 0, ...ALERT_POOL[4] },
  ])
  const [trucks, setTrucks] = useState<Truck[]>(freshTrucks)
  // Background fleet beyond the eight trucks shown in the Fleet table.
  const [fleetStates, setFleetStates] = useState({ Loading: 14, Hauling: 28, Spotting: 6, Queuing: 4, Down: 2 })

  const step = actual.length - 1
  const plan = PLAN[shift]
  const planStep = plan / STEPS
  const downCount = fleetStates.Down + trucks.filter((t) => t.state === "Down").length
  const availability = (FLEET - downCount) / FLEET

  const advance = () => {
    if (step >= STEPS) return setRunning(false)

    // Production tracks plan, scaled by how much of the fleet is available.
    const noise = 0.86 + Math.random() * 0.26
    setActual((series) => [...series, series[series.length - 1] + planStep * noise * (availability / 0.95)])

    setTrucks((list) =>
      list.map((truck) =>
        truck.state === "Down" || Math.random() > 0.45
          ? truck
          : { ...truck, state: STATES[(STATES.indexOf(truck.state) + 1) % 4] },
      ),
    )

    setFleetStates((states) => {
      const next = { ...states }
      const from = STATES[Math.floor(Math.random() * 4)]
      const to = STATES[Math.floor(Math.random() * 4)]
      if (next[from] > 2) {
        next[from] -= 1
        next[to] += 1
      }
      return next
    })

    if (Math.random() < 0.18) {
      const template = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)]
      setAlerts((list) => [{ id: Date.now(), minute: (step + 1) * 10, ...template }, ...list].slice(0, 8))
    }
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef)
  useInterval(advance, running && inView ? 1100 : null)

  const reset = (nextShift = shift) => {
    setShift(nextShift)
    setActual([0])
    setTrucks(freshTrucks())
    setAlerts([{ id: 1, minute: 0, ...ALERT_POOL[1] }])
  }

  const moved = actual[step]
  const planToDate = planStep * step
  const vsPlan = step ? (moved / planToDate) * 100 : 100
  const forecast = step ? (moved / step) * STEPS : plan

  const counts = useMemo(() => {
    const c = { ...fleetStates }
    trucks.forEach((t) => (c[t.state] += 1))
    return c
  }, [fleetStates, trucks])

  // Chart geometry
  const W = 560
  const H = 190
  const yMax = plan * 1.12
  const x = (i: number) => (i / STEPS) * W
  const y = (v: number) => H - (v / yMax) * H
  const line = actual.map((v, i) => `${x(i)},${y(v)}`).join(" ")
  const area = `0,${H} ${line} ${x(step)},${H}`

  const toggleDown = (id: string) =>
    setTrucks((list) =>
      list.map((t) => (t.id === id ? { ...t, state: t.state === "Down" ? "Queuing" : "Down" } : t)),
    )

  return (
    <div className="mb-app proto proto-mb" ref={rootRef}>
      <nav className="mb-side" aria-label="MineBook prototype">
        <p className="mb-logo">
          <i aria-hidden="true" />
          MineBook
        </p>
        {(
          [
            ["overview", "Overview"],
            ["fleet", "Fleet"],
            ["alerts", "Alerts"],
          ] as [View, string][]
        ).map(([id, label]) => (
          <button
            type="button"
            key={id}
            aria-current={view === id ? "page" : undefined}
            onClick={() => setView(id)}
          >
            {label}
            {id === "alerts" && alerts.length ? <b>{alerts.length}</b> : null}
          </button>
        ))}
      </nav>

      <div className="mb-main">
        <div className="mb-head proto-spread">
          <h3>
            {view === "overview" ? "Overview" : view === "fleet" ? "Fleet" : "Alerts"}{" "}
            <span className="proto-pill is-accent">
              {shift} shift · {clock(shift, step * 10)}
            </span>
          </h3>
          <div className="proto-row">
            <Segmented
              label="Shift"
              value={shift}
              options={[
                { value: "Day", label: "Day" },
                { value: "Night", label: "Night" },
              ]}
              onChange={(value) => reset(value)}
            />
            <button className="proto-btn" type="button" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {running ? "Pause" : step >= STEPS ? "Shift complete" : "Run shift"}
            </button>
            <button className="proto-btn is-ghost" type="button" onClick={() => reset()} aria-label="Restart shift">
              <RotateCcw aria-hidden="true" />
            </button>
          </div>
        </div>

        {view === "overview" ? (
          <>
            <div className="proto-kpis">
              <Kpi
                label="Material moved"
                value={`${fmt(moved)} t`}
                note={`${fmt(vsPlan, 1)}% of plan to date`}
                tone={vsPlan >= 98 ? "ok" : vsPlan >= 92 ? "warn" : "bad"}
              />
              <Kpi label="Shift forecast" value={`${fmt(forecast)} t`} note={`Plan ${fmt(plan)} t`} />
              <Kpi
                label="Equipment availability"
                value={`${fmt(availability * 100, 1)}%`}
                note={`${downCount} down of ${FLEET}`}
                tone={availability >= 0.9 ? "ok" : "warn"}
              />
              <Kpi label="Open alerts" value={alerts.length} note={alerts.length ? "Needs attention" : "All clear"} tone={alerts.length ? "warn" : "ok"} />
            </div>

            <div className="proto-panel">
              <div className="proto-spread">
                <h4>Pit production · cumulative vs plan</h4>
                <span className="proto-note">Dashed = plan</span>
              </div>
              <svg className="proto-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Production ${fmt(moved)} tonnes against plan`}>
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <line key={f} x1="0" x2={W} y1={y(plan * f)} y2={y(plan * f)} stroke="rgba(0,0,0,.06)" />
                ))}
                <line x1="0" y1={H} x2={W} y2={y(plan)} stroke="#9a9a9a" strokeDasharray="6 5" strokeWidth="1.5" />
                <polygon points={area} fill="var(--mb)" opacity="0.14" />
                <polyline points={line} fill="none" stroke="var(--mb)" strokeWidth="2.5" strokeLinejoin="round" />
                <circle cx={x(step)} cy={y(moved)} r="4.5" fill="var(--mb-strong)" />
              </svg>
            </div>

            <div className="proto-panel">
              <h4>Haulage status</h4>
              <div className="mb-states">
                {STATES.map((s) => (
                  <Kpi key={s} label={s} value={counts[s]} />
                ))}
              </div>
            </div>
          </>
        ) : null}

        {view === "fleet" ? (
          <div className="proto-panel proto-scroll">
            <h4>Haul trucks · click to change status</h4>
            <table className="proto-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Payload</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {trucks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.id}</strong>
                    </td>
                    <td>
                      <span
                        className={`proto-pill ${t.state === "Down" ? "is-bad" : t.state === "Queuing" ? "is-warn" : "is-ok"}`}
                      >
                        {t.state}
                      </span>
                    </td>
                    <td>{t.payload} t</td>
                    <td>
                      <button type="button" onClick={() => toggleDown(t.id)}>
                        {t.state === "Down" ? "Return to service" : "Mark down"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="proto-note" style={{ marginTop: 10 }}>
              Taking trucks down lowers availability — watch the production rate on Overview.
            </p>
          </div>
        ) : null}

        {view === "alerts" ? (
          <div className="proto-panel">
            <h4>Live alerts</h4>
            {alerts.length ? (
              alerts.map((a) => (
                <div className="mb-alert" key={a.id}>
                  <span className={`proto-pill is-${a.severity === "info" ? "accent" : a.severity}`}>
                    {a.severity === "bad" ? "Critical" : a.severity === "warn" ? "Warning" : "Info"}
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <small>
                      {a.area} · <time>{clock(shift, a.minute)}</time>
                    </small>
                  </div>
                  <button
                    className="proto-btn is-ghost"
                    type="button"
                    onClick={() => setAlerts((list) => list.filter((x) => x.id !== a.id))}
                  >
                    Acknowledge
                  </button>
                </div>
              ))
            ) : (
              <p className="proto-note">No open alerts.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
