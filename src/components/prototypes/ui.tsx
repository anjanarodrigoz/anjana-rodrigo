import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react"

/** Labelled range input with a live value readout. */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  format,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  format?: (value: number) => string
}) {
  const id = useId()
  return (
    <div className="proto-field">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>
          {format ? format(value) : value}
          {unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

/** Segmented single-choice control. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="proto-seg" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Kpi({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: "ok" | "warn" | "bad"
}) {
  return (
    <div className="proto-kpi">
      <small>{label}</small>
      <strong>{value}</strong>
      {note ? <em className={tone ? `is-${tone}` : undefined}>{note}</em> : null}
    </div>
  )
}

/** setInterval that always calls the latest callback; `null` delay pauses. */
export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback)
  saved.current = callback

  useEffect(() => {
    if (delay === null) return
    const id = window.setInterval(() => saved.current(), delay)
    return () => window.clearInterval(id)
  }, [delay])
}

/** requestAnimationFrame loop delivering seconds since the last frame. */
export function useFrame(callback: (dt: number) => void, running: boolean) {
  const saved = useRef(callback)
  saved.current = callback

  useEffect(() => {
    if (!running) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      // Clamp so a backgrounded tab doesn't teleport everything on return.
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      saved.current(dt)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [running])
}

export const fmt = (value: number, digits = 0) =>
  value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** True while the element is on (or near) screen — used to pause simulations. */
export function useInView(ref: RefObject<Element>) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return setInView(true)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px" })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
