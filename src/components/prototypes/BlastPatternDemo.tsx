import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { Kpi, Segmented, Slider, fmt } from "./ui"

type Layout = "square" | "staggered"

/**
 * Bench blast pattern calculator. Rules of thumb follow common open-pit
 * practice (burden ≈ 25–40 × hole diameter, S/B 1.0–1.5, stemming ≥ 0.7 B,
 * subdrill 0.2–0.5 B). Illustrative only — not a substitute for a blast plan.
 */
export function BlastPatternDemo() {
  const [rows, setRows] = useState(4)
  const [perRow, setPerRow] = useState(10)
  const [burden, setBurden] = useState(4.5)
  const [spacing, setSpacing] = useState(5.5)
  const [bench, setBench] = useState(10)
  const [subdrill, setSubdrill] = useState(1.2)
  const [stemming, setStemming] = useState(3.5)
  const [diameter, setDiameter] = useState(165)
  const [explosive, setExplosive] = useState(1.15)
  const [rock, setRock] = useState(2.6)
  const [layout, setLayout] = useState<Layout>("staggered")
  const [timing, setTiming] = useState(true)

  const r = useMemo(() => {
    const holes = rows * perRow
    const holeLength = bench + subdrill
    const charge = Math.max(0, holeLength - stemming)
    const linear = (Math.PI / 4) * (diameter / 1000) ** 2 * explosive * 1000 // kg/m
    const perHole = linear * charge
    const total = perHole * holes
    const volume = holes * burden * spacing * bench
    const tonnes = volume * rock
    return { holes, holeLength, charge, linear, perHole, total, volume, tonnes, pfV: total / volume, pfT: total / tonnes }
  }, [rows, perRow, burden, spacing, bench, subdrill, stemming, diameter, explosive, rock])

  const checks = [
    {
      ok: spacing / burden >= 1 && spacing / burden <= 1.5,
      warn: spacing / burden >= 0.9 && spacing / burden <= 1.7,
      text: `Spacing/burden ${fmt(spacing / burden, 2)} (target 1.0–1.5)`,
    },
    {
      ok: burden / (diameter / 1000) >= 25 && burden / (diameter / 1000) <= 40,
      warn: burden / (diameter / 1000) >= 20 && burden / (diameter / 1000) <= 45,
      text: `Burden ${fmt(burden / (diameter / 1000), 0)} × hole diameter (target 25–40)`,
    },
    {
      ok: stemming >= 0.7 * burden,
      warn: stemming >= 0.55 * burden,
      text: `Stemming ${fmt(stemming, 1)} m (min ${fmt(0.7 * burden, 1)} m to control flyrock)`,
    },
    {
      ok: subdrill >= 0.2 * burden && subdrill <= 0.5 * burden,
      warn: subdrill >= 0.1 * burden && subdrill <= 0.6 * burden,
      text: `Subdrill ${fmt(subdrill, 1)} m (target ${fmt(0.2 * burden, 1)}–${fmt(0.5 * burden, 1)} m)`,
    },
    {
      ok: r.charge > 0,
      warn: false,
      text: r.charge > 0 ? `Charge column ${fmt(r.charge, 1)} m` : "No charge column — stemming exceeds hole length",
    },
  ].map((c) => ({ ...c, tone: c.ok ? "ok" : c.warn ? "warn" : "bad" }))

  const failing = checks.filter((c) => c.tone === "bad").length

  // Plan view geometry
  const pad = 36
  const scale = Math.min((600 - pad * 2) / (perRow * spacing), (320 - pad * 2 - 20) / (rows * burden))
  const holes = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: perRow }, (_, col) => {
      const offset = layout === "staggered" && row % 2 ? spacing / 2 : 0
      const x = pad + (col * spacing + spacing / 2 + offset) * scale
      const y = pad + 20 + (row * burden + burden / 2) * scale
      // V-pattern timing from the centre of the free face: 17 ms along row, 42 ms between rows.
      const delay = Math.round(Math.abs(col - (perRow - 1) / 2) * 17 + row * 42)
      return { row, col, x, y, delay, east: col * spacing + offset, north: -row * burden }
    }),
  ).flat()

  const exportCsv = () => {
    const header = "hole_id,row,col,easting_m,northing_m,depth_m,charge_kg,delay_ms"
    const lines = holes.map(
      (h) =>
        `R${h.row + 1}H${h.col + 1},${h.row + 1},${h.col + 1},${h.east.toFixed(2)},${h.north.toFixed(2)},${r.holeLength.toFixed(1)},${r.perHole.toFixed(1)},${h.delay}`,
    )
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "blast-pattern.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="proto">
      <div className="proto-kpis">
        <Kpi label="Holes" value={r.holes} note={`${fmt(r.holeLength, 1)} m deep`} />
        <Kpi label="Rock broken" value={`${fmt(r.tonnes)} t`} note={`${fmt(r.volume)} m³`} />
        <Kpi label="Explosive" value={`${fmt(r.total)} kg`} note={`${fmt(r.perHole, 0)} kg / hole`} />
        <Kpi
          label="Powder factor"
          value={`${fmt(r.pfV, 2)} kg/m³`}
          note={`${fmt(r.pfT, 2)} kg/t`}
          tone={r.pfV >= 0.25 && r.pfV <= 0.9 ? "ok" : "warn"}
        />
      </div>

      <div className="proto-layout">
        <div className="proto-panel">
          <h4>Pattern</h4>
          <div className="proto-field">
            <Segmented
              label="Layout"
              value={layout}
              options={[
                { value: "staggered", label: "Staggered" },
                { value: "square", label: "Square" },
              ]}
              onChange={setLayout}
            />
          </div>
          <Slider label="Rows" value={rows} onChange={setRows} min={1} max={8} />
          <Slider label="Holes per row" value={perRow} onChange={setPerRow} min={3} max={16} />
          <Slider label="Burden" value={burden} onChange={setBurden} min={2} max={8} step={0.1} unit=" m" />
          <Slider label="Spacing" value={spacing} onChange={setSpacing} min={2} max={10} step={0.1} unit=" m" />
          <h4 style={{ marginTop: 18 }}>Hole & charge</h4>
          <Slider label="Bench height" value={bench} onChange={setBench} min={4} max={16} step={0.5} unit=" m" />
          <Slider label="Subdrill" value={subdrill} onChange={setSubdrill} min={0} max={3} step={0.1} unit=" m" />
          <Slider label="Stemming" value={stemming} onChange={setStemming} min={1} max={7} step={0.1} unit=" m" />
          <Slider label="Hole diameter" value={diameter} onChange={setDiameter} min={89} max={311} unit=" mm" />
          <Slider label="Explosive density" value={explosive} onChange={setExplosive} min={0.8} max={1.35} step={0.01} unit=" g/cc" />
          <Slider label="Rock density" value={rock} onChange={setRock} min={2} max={3.2} step={0.05} unit=" t/m³" />
        </div>

        <div className="proto">
          <div className="proto-panel">
            <div className="proto-spread">
              <h4>Plan view · free face at top</h4>
              <div className="proto-row">
                <button className="proto-btn is-ghost" type="button" onClick={() => setTiming((t) => !t)}>
                  {timing ? "Hide timing" : "Show timing"}
                </button>
                <button className="proto-btn" type="button" onClick={exportCsv} disabled={failing > 0}>
                  <Download aria-hidden="true" />
                  Export CSV
                </button>
              </div>
            </div>
            <svg className="proto-svg" viewBox="0 0 600 320" role="img" aria-label={`Blast pattern with ${r.holes} holes`}>
              <line x1={pad} x2={600 - pad} y1={pad + 4} y2={pad + 4} stroke="#1d2b45" strokeWidth="3" />
              <text x={pad} y={pad - 6} fontSize="11" fill="#4d5868">
                Free face
              </text>
              {holes.map((h) => (
                <g key={`${h.row}-${h.col}`}>
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={Math.max(3, Math.min(9, (diameter / 1000) * scale * 2.2))}
                    fill={h.row === 0 ? "var(--blue)" : "#fff"}
                    stroke="var(--blue)"
                    strokeWidth="2"
                  />
                  {timing ? (
                    <text x={h.x} y={h.y + 18} textAnchor="middle" fontSize="9" fill="#4d5868">
                      {h.delay}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
            <p className="proto-note" style={{ marginTop: 8 }}>
              Filled = front row. Numbers = delay (ms), V-pattern from centre.
            </p>
          </div>

          <div className="proto-panel">
            <h4>Design checks {failing ? `· ${failing} failing — export locked` : "· ready to export"}</h4>
            <ul className="proto-checks">
              {checks.map((c) => (
                <li key={c.text} className={`is-${c.tone}`}>
                  <i />
                  {c.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
