import type { ReactNode } from "react"
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react"

import { prototypes } from "@/components/prototypes/registry"
import { GuideArrow } from "@/components/tour/GuideArrow"
import { GuideNote } from "@/components/tour/GuideNote"
import { IslandCanvas } from "@/components/tour/IslandCanvas"
import { TourRail } from "@/components/tour/TourRail"
import { useActiveStage } from "@/components/tour/useActiveStage"
import { capabilities, contact, credentials, expertise, minebook, projects, roles } from "@/content"
import type { StageId } from "@/journey"

/** Each product's stop on the island, in tour order. */
const productStops: { id: string; stage: StageId }[] = [
  { id: "blast-pattern", stage: "drill" },
  { id: "fleet-dispatch", stage: "load" },
  { id: "cycle-time", stage: "haul" },
  { id: "crack-survey", stage: "walls" },
]

/** A tour stop: open space to see the island and the guide, then a content card. */
function Stop({ stage, id, children, label }: { stage: StageId; id: string; children: ReactNode; label: string }) {
  return (
    <section className="stop" id={id} data-stage={stage} aria-label={label}>
      <div className="wrap">
        <div className="stop-view">
          <GuideNote stage={stage} />
        </div>
        <div className="card">{children}</div>
      </div>
    </section>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>
}

export default function App() {
  const active = useActiveStage()
  const MineBookPrototype = prototypes.minebook

  return (
    <>
      <IslandCanvas />
      <GuideArrow />

      <header className="topbar">
        <a className="brand" href="#welcome" aria-label="Anjana Rodrigo — back to top">
          <img src="/assets/brand/ar-logo.png" alt="" width="36" height="36" />
          <span>Anjana Rodrigo</span>
        </a>
        <a className="pill pill-solid" href="#contact">
          Let&apos;s talk
        </a>
      </header>

      <TourRail active={active} />

      <main>
        {/* 01 · Welcome */}
        <section className="welcome" id="welcome" data-stage="welcome" aria-label="Welcome">
          <div className="wrap welcome-grid">
            <div className="welcome-copy">
              <Kicker>Mining engineer · Software developer</Kicker>
              <h1>
                Anjana
                <br />
                Rodrigo
              </h1>
              <p className="welcome-line">I build software that runs mines better.</p>
              <div className="actions">
                <a className="pill pill-solid pill-lg" href="#about">
                  Start the tour
                  <ArrowDown aria-hidden="true" />
                </a>
                <a className="pill pill-lg" href={minebook.url} target="_blank" rel="noreferrer">
                  MineBook
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
              <GuideNote stage="welcome" />
            </div>
          </div>
        </section>

        {/* 02 · About */}
        <Stop stage="office" id="about" label="About me">
          <div className="about">
            <img className="about-photo" src="/assets/about/anjana-professional.png" alt="Anjana Rodrigo" loading="lazy" />
            <div className="about-copy">
              <Kicker>About me</Kicker>
              <h2>Engineering judgement, written as software.</h2>
              <p className="lead">
                Earth Resources Engineer (University of Moratuwa) building tools for real operations since 2020.
              </p>
              <ul className="chips">
                {capabilities.map((c) => {
                  const Icon = c.icon
                  return (
                    <li key={c.title}>
                      <Icon aria-hidden="true" />
                      {c.title}
                    </li>
                  )
                })}
              </ul>
              <ul className="chips chips-quiet">
                {expertise.map((e) => (
                  <li key={e.label}>{e.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </Stop>

        {/* 03 · MineBook */}
        <Stop stage="control" id="minebook" label="MineBook">
          <div className="card-head">
            <div>
              <Kicker>Project 01 · Flagship</Kicker>
              <h2>MineBook</h2>
              <p className="lead">The whole operation on one screen.</p>
            </div>
            <a className="pill pill-solid" href={minebook.onboardUrl} target="_blank" rel="noreferrer">
              Onboard at minebook.lk
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="browser">
            <div className="browser-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>minebook.lk</span>
            </div>
            <MineBookPrototype />
          </div>
          <ol className="steps">
            {minebook.steps.map((s) => (
              <li key={s.index}>
                <b>{s.index}</b>
                {s.title}
              </li>
            ))}
          </ol>
        </Stop>

        {/* 04–07 · Products at their places in the mine */}
        {productStops.map(({ id, stage }, i) => {
          const project = projects.find((p) => p.id === id)
          const Prototype = prototypes[id]
          if (!project || !Prototype) return null
          return (
            <Stop stage={stage} id={i === 0 ? "work" : id} label={project.title} key={id}>
              <div className="card-head">
                <div>
                  <Kicker>
                    Project {String(i + 2).padStart(2, "0")} · {project.discipline}
                  </Kicker>
                  <h2>{project.title}</h2>
                </div>
                <a className="pill" href="#contact">
                  Discuss
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
              <Prototype />
            </Stop>
          )
        })}

        {/* 08 · Experience & credentials */}
        <Stop stage="lookout" id="experience" label="Experience">
          <Kicker>Experience</Kicker>
          <h2>Where I&apos;ve worked.</h2>
          <ol className="roles">
            {roles.map((r) => (
              <li key={r.role} className={r.current ? "is-current" : undefined}>
                <span>{r.period}</span>
                <strong>{r.role}</strong>
                <em>{r.org}</em>
              </li>
            ))}
          </ol>
          <Kicker>Credentials</Kicker>
          <ul className="creds">
            {credentials.map((c) => {
              const Icon = c.icon
              return (
                <li key={c.institution}>
                  <span className="cred-icon">
                    <Icon />
                  </span>
                  <strong>{c.institution}</strong>
                  <span>{c.detail}</span>
                  <em>{c.period}</em>
                </li>
              )
            })}
          </ul>
        </Stop>

        {/* 09 · Contact */}
        <Stop stage="gate" id="contact" label="Contact">
          <div className="contact">
            <div>
              <Kicker>Contact</Kicker>
              <h2>Have a mine worth improving?</h2>
              <div className="actions">
                <a className="pill pill-solid pill-lg" href={contact.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" />
                  WhatsApp
                </a>
                <a className="pill pill-lg" href={`mailto:${contact.email}`}>
                  <Mail aria-hidden="true" />
                  Email
                </a>
              </div>
            </div>
            <ul className="contact-list">
              <li>
                <Mail aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <Phone aria-hidden="true" />
                <a href={`tel:${contact.phoneRaw}`}>{contact.phone}</a>
              </li>
              <li>
                <Linkedin aria-hidden="true" />
                <a href={contact.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <Github aria-hidden="true" />
                <a href={contact.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </Stop>
      </main>

      <footer className="footer">
        <span>© 2026 Anjana Rodrigo</span>
        <span>Mining engineering · Software</span>
      </footer>
    </>
  )
}
