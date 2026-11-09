import { useState } from "react"
import { RotateCcw } from "lucide-react"

import { Kpi, Slider, fmt } from "./ui"

const SEGMENTS = [
  { key: "queue", label: "Queue", color: "#c42b2b", delay: true },
  { key: "spot", label: "Spot", color: "#9db8ee", delay: false },
  { key: "load", label: "Load", color: "#0b5fe0", delay: false },
  { key: "haul", label: "Haul", color: "#0847ab", delay: false },
  { key: "dump", label: "Dump", color: "#5d8fe8", delay: false },
  { key: "ret", label: "Return", color: "#7ea6ef", delay: false },
] as const

type Key = (typeof SEGMENTS)[number]["key"]

const DEFAULTS: Record<Key, number> = { queue: 4.3, spot: 1.8, load: 2.4, haul: 11.5, dump: 1.2, ret: 8.4 }

export function CycleTimeDemo() {
  const [times, setTimes] = useState(DEFAULTS)
  const [payload, setPayload] = useState(214)
  const [fleet, setFleet] = useState(24)
  const [hours, setHours] = useState(10.5)

  const set = (key: Key) => (value: number) => setTimes((t) => ({ ...t, [key]: value }))

  const cycle = SEGMENTS.reduce((sum, s) => sum + times[s.key], 0)
  const perTruck = 60 / cycle
  const tph = perTruck * payload * fleet
  const shift = tph * hours
  const baseline = SEGMENTS.reduce((sum, s) => sum + DEFAULTS[s.key], 0)
  const delayShare = ((times.queue + times.spot) / cycle) * 100

  // The single change that would add the most tonnes this shift.
  const levers = SEGMENTS.map((s) => {
    const trimmed = s.key === "queue" ? 0 : times[s.key] * 0.85
    const newCycle = cycle - times[s.key] + trimmed
    return { ...s, gain: (60 / newCycle) * payload * fleet * hours - shift }
  }).sort((a, b) => b.gain - a.gain)
  const top = levers[0]

  return (
    <div className="proto">
      <div className="proto-kpis">
        <Kpi
          label="Cycle time"
          value={`${fmt(cycle, 1)} min`}
          note={`${cycle <= baseline ? "−" : "+"}${fmt(Math.abs(cycle - baseline), 1)} min vs baseline`}
          tone={cycle <= baseline ? "ok" : "bad"}
        />
        <Kpi label="Cycles / truck / h" value={fmt(perTruck, 2)} />
        <Kpi label="Fleet output" value={`${fmt(tph)} t/h`} />
        <Kpi label="Per shift" value={`${fmt(shift)} t`} note={`${fmt(delayShare, 0)}% of cycle is delay`} tone={delayShare > 20 ? "warn" : "ok"} />
      </div>

      <div className="proto-layout">
        <div className="proto-panel">
          <h4>Cycle components (min)</h4>
          <Slider label="Queue at shovel" value={times.queue} onChange={set("queue")} min={0} max={12} step={0.1} />
          <Slider label="Spot" value={times.spot} onChange={set("spot")} min={0.2} max={4} step={0.1} />
          <Slider label="Load" value={times.load} onChange={set("load")} min={1} max={6} step={0.1} />
          <Slider label="Haul (loaded)" value={times.haul} onChange={set("haul")} min={3} max={25} step={0.1} />
          <Slider label="Dump" value={times.dump} onChange={set("dump")} min={0.5} max={4} step={0.1} />
          <Slider label="Return (empty)" value={times.ret} onChange={set("ret")} min={2} max={20} step={0.1} />
          <h4 style={{ marginTop: 18 }}>Fleet</h4>
          <Slider label="Payload" value={payload} onChange={setPayload} min={90} max={360} unit=" t" />
          <Slider label="Trucks" value={fleet} onChange={setFleet} min={1} max={60} />
          <Slider label="Operating hours / shift" value={hours} onChange={setHours} min={6} max={12} step={0.5} unit=" h" />
        </div>

        <div className="proto">
          <div className="proto-panel">
            <h4>Where the cycle goes</h4>
            <svg className="proto-svg" viewBox="0 0 600 70" role="img" aria-label="Stacked cycle time breakdown">
              {(() => {
                let x = 0
                return SEGMENTS.map((s) => {
                  const w = (times[s.key] / cycle) * 600
                  const node = (
                    <g key={s.key}>
                      <rect x={x} y="10" width={Math.max(0, w - 2)} height="50" rx="6" fill={s.color} />
                      {w > 44 ? (
                        <text x={x + w / 2} y="40" textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">
                          {s.label}
                        </text>
                      ) : null}
                    </g>
                  )
                  x += w
                  return node
                })
              })()}
            </svg>
            <table className="proto-table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Minutes</th>
                  <th>Share</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {SEGMENTS.map((s) => (
                  <tr key={s.key}>
                    <td>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: s.color, marginRight: 8 }} />
                      {s.label}
                    </td>
                    <td>{fmt(times[s.key], 1)}</td>
                    <td>{fmt((times[s.key] / cycle) * 100, 0)}%</td>
                    <td>
                      <span className={`proto-pill ${s.delay || s.key === "spot" ? "is-warn" : ""}`}>
                        {s.delay || s.key === "spot" ? "Delay" : "Productive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="proto-panel">
            <h4>Biggest lever</h4>
            <p>
              <strong>
                {top.key === "queue" ? "Eliminate queuing" : `Cut ${top.label.toLowerCase()} time by 15%`}
              </strong>{" "}
              → +{fmt(top.gain)} t this shift.
            </p>
            <div className="proto-row" style={{ marginTop: 12 }}>
              <button className="proto-btn" type="button" onClick={() => setTimes((t) => ({ ...t, queue: 0 }))}>
                What if: no queue
              </button>
              <button className="proto-btn is-ghost" type="button" onClick={() => setTimes(DEFAULTS)}>
                <RotateCcw aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
