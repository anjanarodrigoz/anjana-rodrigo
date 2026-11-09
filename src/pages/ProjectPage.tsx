import { ArrowLeft, ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react"

import { prototypes } from "@/components/prototypes/registry"
import { contact, minebook, projects } from "@/content"
import { stages } from "@/journey"
import { href, projectStage } from "@/router"

import { PageShell } from "./PageShell"

const order = ["minebook", "blast-pattern", "fleet-dispatch", "cycle-time", "crack-survey"]

export function ProjectPage({ id }: { id: string }) {
  const project = projects.find((p) => p.id === id)
  const Prototype = prototypes[id]
  const stage = projectStage[id]

  if (!project || !Prototype) {
    return (
      <PageShell backLabel="Back to the mine">
        <h1 className="page-title">Project not found</h1>
      </PageShell>
    )
  }

  const i = order.indexOf(id)
  const prev = order[(i - 1 + order.length) % order.length]
  const next = order[(i + 1) % order.length]
  const title = (pid: string) => projects.find((p) => p.id === pid)?.title
  const place = stages.find((s) => s.id === stage)?.place

  return (
    <PageShell back={stage} backLabel={`Back to the ${place?.toLowerCase() ?? "mine"}`}>
      <section className="page-head">
        <p className="tag">
          Project {String(i + 1).padStart(2, "0")} · {project.discipline} · {project.year}
        </p>
        <h1 className="page-title">{project.title}</h1>
        <p className="page-lead">{project.copy}</p>
        <div className="card-actions">
          {id === "minebook" ? (
            <a className="pill pill-solid pill-lg" href={minebook.onboardUrl} target="_blank" rel="noreferrer">
              Onboard at minebook.lk
              <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
          <a className={`pill pill-lg ${id === "minebook" ? "" : "pill-solid"}`} href={contact.whatsapp} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" />
            Discuss this project
          </a>
        </div>
      </section>

      {id === "minebook" ? (
        <section className="facts" aria-label="What MineBook covers">
          {minebook.features.map((f) => (
            <div key={f.label}>
              <h2>{f.label}</h2>
              <p>{f.copy}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="demo" aria-label={`${project.title} working prototype`}>
        <div className="demo-bar">
          <span>Working prototype</span>
          <em>Simulated data — try the controls</em>
        </div>
        <div className="demo-body">
          <Prototype />
        </div>
      </section>

      {id === "minebook" ? (
        <section className="onboard" aria-label="Onboarding">
          <h2>Bring your operation onboard</h2>
          <ol>
            {minebook.steps.map((s) => (
              <li key={s.index}>
                <b>{s.index}</b>
                <div>
                  <strong>{s.title}</strong>
                  <span>{s.copy}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <nav className="pager" aria-label="Other projects">
        <a href={href.project(prev)}>
          <ArrowLeft aria-hidden="true" />
          <span>
            <small>Previous</small>
            {title(prev)}
          </span>
        </a>
        <a href={href.project(next)}>
          <span>
            <small>Next</small>
            {title(next)}
          </span>
          <ArrowRight aria-hidden="true" />
        </a>
      </nav>
    </PageShell>
  )
}
