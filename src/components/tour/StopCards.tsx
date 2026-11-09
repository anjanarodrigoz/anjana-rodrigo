import { useEffect, useRef, type ReactNode } from "react"
import { ArrowRight, ArrowUpRight, Mail, MessageCircle } from "lucide-react"

import { contact, minebook, projects, roles } from "@/content"
import { screenAnchors, stages, type StageId } from "@/journey"
import { href, projectStage } from "@/router"

const PHOTO = "/assets/about/anjana-professional.png"

function ProjectCard({ id, index }: { id: string; index: number }) {
  const p = projects.find((x) => x.id === id)
  if (!p) return null
  return (
    <>
      <p className="tag">
        Project {String(index).padStart(2, "0")} · {stages.find((s) => s.id === projectStage[id])?.place}
      </p>
      <h2>{p.title}</h2>
      <p>{p.copy}</p>
      <div className="tag-row">
        <span>{p.discipline}</span>
        <span>{p.year}</span>
      </div>
      <a className="pill pill-solid" href={href.project(id)}>
        Open project
        <ArrowRight aria-hidden="true" />
      </a>
    </>
  )
}

const cards: Record<StageId, ReactNode> = {
  welcome: (
    <>
      <div className="who">
        <img src={PHOTO} alt="" width="48" height="48" />
        <div>
          <h1>Hi, I&apos;m Anjana Rodrigo</h1>
          <p>Mining engineer · Software developer</p>
        </div>
      </div>
      <p>I build software that runs mines better. Scroll and I&apos;ll walk you through the mine.</p>
      <p className="scroll-hint" aria-hidden="true">
        <i /> Scroll to walk
      </p>
    </>
  ),
  office: (
    <>
      <div className="who">
        <img src={PHOTO} alt="" width="48" height="48" />
        <div>
          <p className="tag">Site office</p>
          <h2>About me</h2>
        </div>
      </div>
      <p>
        CTO at Starloge (Pvt) Ltd and founder of MineBook. Earth Resources Engineer (University of Moratuwa), building
        tools for real operations since 2020.
      </p>
      <a className="pill" href={href.about()}>
        More about me
        <ArrowRight aria-hidden="true" />
      </a>
    </>
  ),
  control: (
    <>
      <p className="tag">Founder · Since 2024</p>
      <h2>MineBook</h2>
      <p>
        Mining data processing for the whole operation. Every drill, shovel, truck, crusher, stockpile, plant and
        office in this mine reports into one connected system.
      </p>
      <div className="card-actions">
        <a className="pill pill-solid" href={href.project("minebook")}>
          Open project
          <ArrowRight aria-hidden="true" />
        </a>
        <a className="pill" href={minebook.onboardUrl} target="_blank" rel="noreferrer">
          minebook.lk
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </>
  ),
  drill: <ProjectCard id="blast-pattern" index={2} />,
  load: <ProjectCard id="fleet-dispatch" index={3} />,
  haul: <ProjectCard id="cycle-time" index={4} />,
  walls: <ProjectCard id="crack-survey" index={5} />,
  lookout: (
    <>
      <p className="tag">Lookout</p>
      <h2>Experience</h2>
      <ul className="mini-roles">
        {roles
          .filter((r) => r.current)
          .map((r) => (
            <li key={r.role} className="is-current">
              <strong>
                {r.role}, {r.org}
              </strong>
              <span>{r.period}</span>
            </li>
          ))}
      </ul>
      <p className="fine">
        Previously:{" "}
        {roles
          .filter((r) => !r.current)
          .map((r) => r.org)
          .join(" · ")}
      </p>
      <a className="pill" href={href.about()}>
        Experience & credentials
        <ArrowRight aria-hidden="true" />
      </a>
    </>
  ),
  gate: (
    <>
      <p className="tag">Mine gate</p>
      <h2>Have a mine worth improving?</h2>
      <div className="card-actions">
        <a className="pill pill-solid" href={contact.whatsapp} target="_blank" rel="noreferrer">
          <MessageCircle aria-hidden="true" />
          WhatsApp
        </a>
        <a className="pill" href={`mailto:${contact.email}`}>
          <Mail aria-hidden="true" />
          Email
        </a>
      </div>
      <p className="fine">{contact.email} · {contact.phone}</p>
    </>
  ),
}

/**
 * One small card per stop, pinned beside the object it describes in the 3D
 * mine with a leader line. Only the current stop's card is shown. Positions
 * update every frame without re-rendering React.
 */
export function StopCards({ active }: { active: StageId }) {
  const refs = useRef<Partial<Record<StageId, HTMLElement | null>>>({})
  const lineRef = useRef<SVGLineElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  // Inactive cards leave the tab order and the accessibility tree.
  useEffect(() => {
    for (const s of stages) refs.current[s.id]?.toggleAttribute("inert", s.id !== active)
  }, [active])

  useEffect(() => {
    let frame = 0
    const loop = () => {
      frame = requestAnimationFrame(loop)
      const w = window.innerWidth
      const h = window.innerHeight
      const docked = w < 760
      const railRight = w >= 1180 ? 230 : 16

      for (const s of stages) {
        const el = refs.current[s.id]
        if (!el) continue
        const anchor = screenAnchors[s.id]
        const cw = el.offsetWidth
        const ch = el.offsetHeight
        let x: number
        let y: number
        if (docked) {
          x = (w - cw) / 2
          y = h - ch - 58
        } else if (s.id === "control") {
          // MineBook shows the whole mine: keep the card in the open sky.
          x = w - cw - 40
          y = 84
        } else if (anchor?.visible) {
          const right = anchor.x < w * 0.6
          x = right ? anchor.x + 56 : anchor.x - 56 - cw
          y = anchor.y - ch * 0.35
        } else {
          x = w - cw - 32
          y = (h - ch) / 2
        }
        x = Math.max(railRight, Math.min(w - cw - 16, x))
        y = Math.max(76, Math.min(h - ch - (docked ? 58 : 20), y))
        el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`

        if (s.id === activeRef.current) {
          const line = lineRef.current
          const dot = dotRef.current
          if (!line || !dot) continue
          const show = Boolean(anchor?.visible)
          line.style.opacity = dot.style.opacity = show ? "1" : "0"
          if (!show || !anchor) continue
          // Join the anchor to the nearest point on the card's edge.
          const ex = Math.max(x, Math.min(x + cw, anchor.x))
          const ey = Math.max(y, Math.min(y + ch, anchor.y))
          line.setAttribute("x1", String(anchor.x))
          line.setAttribute("y1", String(anchor.y))
          line.setAttribute("x2", String(ex))
          line.setAttribute("y2", String(ey))
          dot.setAttribute("cx", String(anchor.x))
          dot.setAttribute("cy", String(anchor.y))
        }
      }
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="stop-layer">
      <svg className="leader" aria-hidden="true">
        <line ref={lineRef} strokeDasharray="5 5" />
        <circle ref={dotRef} r="6" />
      </svg>
      {stages.map((s) => (
        <article
          key={s.id}
          ref={(el) => (refs.current[s.id] = el)}
          className={`stop-card ${s.id === active ? "is-active" : ""}`}
          aria-hidden={s.id === active ? undefined : true}
        >
          {cards[s.id]}
        </article>
      ))}
    </div>
  )
}
