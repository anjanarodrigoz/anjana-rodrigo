import { useEffect, useRef } from "react"

import { guideScreen } from "@/journey"

/**
 * Draws a curved arrow from the visible guide note to the 3D guide's head,
 * every frame, without re-rendering React.
 */
export function GuideArrow() {
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    let frame = 0
    const loop = () => {
      frame = requestAnimationFrame(loop)
      const path = pathRef.current
      const dot = dotRef.current
      if (!path || !dot) return

      const vh = window.innerHeight
      // The note nearest the upper-middle of the viewport, if any is on screen.
      let note: DOMRect | null = null
      let bestScore = Infinity
      for (const el of document.querySelectorAll<HTMLElement>("[data-guide-note]")) {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue
        const score = Math.abs(r.top + r.height / 2 - vh * 0.4)
        if (score < bestScore) {
          bestScore = score
          note = r
        }
      }

      const show = note !== null && guideScreen.visible
      path.style.opacity = show ? "1" : "0"
      dot.style.opacity = show ? "1" : "0"
      if (!show || !note) return

      const gx = guideScreen.x
      const gy = guideScreen.y
      // Leave from the side of the note facing the guide.
      const sx = gx > note.right ? note.right + 6 : gx < note.left ? note.left - 6 : note.left + note.width / 2
      const sy = gx > note.right || gx < note.left ? note.top + note.height / 2 : gy < note.top ? note.top - 6 : note.bottom + 6
      const mx = (sx + gx) / 2
      const my = Math.min(sy, gy) - Math.abs(gx - sx) * 0.18 - 20
      path.setAttribute("d", `M ${sx} ${sy} Q ${mx} ${my} ${gx} ${gy - 10}`)
      dot.setAttribute("cx", String(sx))
      dot.setAttribute("cy", String(sy))
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg className="guide-arrow" aria-hidden="true">
      <defs>
        <marker id="guide-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <path ref={pathRef} d="" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" markerEnd="url(#guide-head)" />
      <circle ref={dotRef} r="4" fill="currentColor" />
    </svg>
  )
}
