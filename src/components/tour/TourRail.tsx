import { stages, type StageId } from "@/journey"

const go = (id: StageId) =>
  document.querySelector(`[data-stage="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" })

/** Tour stops down the side (desktop) or a progress strip (phones). */
export function TourRail({ active }: { active: StageId }) {
  const index = stages.findIndex((s) => s.id === active)
  return (
    <nav className="tour-rail" aria-label="Tour stops">
      <ol>
        {stages.map((stage, i) => (
          <li key={stage.id}>
            <button
              type="button"
              aria-current={stage.id === active ? "step" : undefined}
              className={i < index ? "is-done" : undefined}
              onClick={() => go(stage.id)}
            >
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span>{stage.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="tour-progress" aria-hidden="true">
        <span style={{ width: `${((index + 1) / stages.length) * 100}%` }} />
        <em>
          {String(index + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")} · {stages[index]?.label}
        </em>
      </p>
    </nav>
  )
}
