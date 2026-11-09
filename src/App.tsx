import { useState, type ReactNode } from "react"
import { ArrowRight, ArrowUpRight, Play, Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react"

import { Header } from "@/components/site/Header"
import { MineCanvas } from "@/components/site/MineCanvas"
import { MineBookDemo } from "@/components/prototypes/MineBookDemo"
import { PrototypeDialog } from "@/components/prototypes/PrototypeDialog"
import { Reveal } from "@/components/site/Reveal"
import { capabilities, contact, credentials, expertise, minebook, nav, projects, roles } from "@/content"
import { useClickSound } from "@/hooks"

function SectionHeading({
  eyebrow,
  children,
  lede,
  align = "left",
}: {
  eyebrow: string
  children: ReactNode
  lede?: string
  align?: "left" | "center"
}) {
  return (
    <div className={`section-heading ${align === "center" ? "is-center" : ""}`}>
      <p className="eyebrow">
        <i aria-hidden="true" />
        {eyebrow}
      </p>
      <h2>{children}</h2>
      {lede ? <p className="section-lede">{lede}</p> : null}
    </div>
  )
}

/** Decorative topographic contour lines — a nod to a mine survey plan. */
function Contours() {
  const outline =
    "M200 40 C280 40 344 92 356 168 C368 244 322 320 250 348 C178 376 96 350 62 288 C28 226 44 138 104 90 C132 68 166 40 200 40 Z"

  return (
    <svg className="contours" viewBox="0 0 400 420" aria-hidden="true" focusable="false">
      {[1, 0.84, 0.68, 0.52, 0.36, 0.2].map((scale) => (
        <path key={scale} d={outline} transform={`translate(205 194) scale(${scale}) translate(-205 -194)`} />
      ))}
    </svg>
  )
}

export default function HomePage() {
  useClickSound()
  const [openProto, setOpenProto] = useState<string | null>(null)
  const [mbView, setMbView] = useState<"live" | "screenshot">("live")
  const openProject = projects.find((project) => project.id === openProto)

  return (
    <>
      <Header />

      <main>
        <section className="hero" id="home">
          <div className="hero-backdrop" aria-hidden="true" />
          <MineCanvas className="hero-canvas" />
          <div className="hero-vignette" aria-hidden="true" />

          <div className="hero-hud" aria-hidden="true">
            <span className="hud-corner tl" />
            <span className="hud-corner tr" />
            <span className="hud-corner bl" />
            <span className="hud-corner br" />
          </div>

          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="status-chip">
                <i aria-hidden="true" />
                Mining engineer · Software developer
              </p>

              <h1>
                Engineering smarter <em>mining operations.</em>
              </h1>

              <p className="hero-lede">Mining engineer building software for the pit.</p>

              <div className="hero-actions">
                <a className="btn btn-primary btn-lg btn-mb" href={minebook.onboardUrl} target="_blank" rel="noreferrer">
                  Onboard to MineBook
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <a className="btn btn-ghost btn-lg" href="#work">
                  Explore selected work
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>

            </div>
          </div>

          <a className="scroll-cue" href="#minebook" aria-label="Scroll to MineBook">
            <span />
          </a>

        </section>

        <section className="capability-band" aria-label="Capabilities">
          <div className="shell">
            <ul className="capability-rail">
              {capabilities.map((item, index) => {
                const Icon = item.icon
                return (
                  <Reveal as="li" key={item.title} step={index}>
                    <span className="capability-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="mono-index">{item.index}</span>
                    <h3>{item.title}</h3>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="section minebook" id="minebook">
          <div className="shell">
            <Reveal className="heading-row">
              <SectionHeading eyebrow="Flagship product">
                MineBook. <em>The whole pit, one screen.</em>
              </SectionHeading>
            </Reveal>

            <Reveal className="minebook-stage">
              <div className="minebook-tabs" role="group" aria-label="MineBook view">
                <button type="button" aria-pressed={mbView === "live"} onClick={() => setMbView("live")}>
                  <Play aria-hidden="true" />
                  Live prototype
                </button>
                <button type="button" aria-pressed={mbView === "screenshot"} onClick={() => setMbView("screenshot")}>
                  Screenshot
                </button>
              </div>
              <div className="minebook-frame">
                <div className="minebook-chrome" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>minebook.lk</span>
                </div>
                {mbView === "live" ? (
                  <MineBookDemo />
                ) : (
                  <img
                    src="/assets/projects/minebook.png"
                    alt="MineBook overview dashboard showing material moved, pit production against plan, haulage status, equipment health, alerts and shift output"
                    width="1513"
                    height="1039"
                    loading="lazy"
                  />
                )}
              </div>
            </Reveal>

            <ul className="minebook-features">
              {minebook.features.map((item, index) => (
                <Reveal as="li" key={item.label} step={index}>
                  <span className="mono-index">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.label}</h3>
                </Reveal>
              ))}
            </ul>

            <Reveal className="onboard-card">
              <div className="onboard-copy">
                <p className="eyebrow">
                  <i aria-hidden="true" />
                  Onboarding now open
                </p>
                <h2>
                  Bring your operation <em>onboard MineBook.</em>
                </h2>
                <div className="onboard-actions">
                  <a className="btn btn-primary btn-lg" href={minebook.onboardUrl} target="_blank" rel="noreferrer">
                    Start onboarding at minebook.lk
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                  <a className="btn btn-ghost btn-lg" href={contact.whatsapp} target="_blank" rel="noreferrer">
                    Book a walkthrough
                  </a>
                </div>
              </div>

              <ol className="onboard-steps">
                {minebook.steps.map((step) => (
                  <li key={step.index}>
                    <span className="onboard-index">{step.index}</span>
                    <div>
                      <h3>{step.title}</h3>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section className="section work" id="work">
          <div className="shell">
            <Reveal className="heading-row">
              <SectionHeading eyebrow="Selected work">
                Projects designed for <em>real operations.</em>
              </SectionHeading>
            </Reveal>

            <div className="project-grid">
              {projects.filter((project) => !project.featured).map((project, index) => (
                <Reveal
                  as="article"
                  key={project.title}
                  step={index}
                  className="project-card"
                >
                  <button
                    className="project-media"
                    type="button"
                    onClick={() => setOpenProto(project.id)}
                    aria-label={`Open the ${project.title} prototype`}
                  >
                    <img src={project.image} alt="" loading="lazy" />
                    <span className="project-play" aria-hidden="true">
                      <Play />
                    </span>
                  </button>

                  <div className="project-body">
                    <p className="project-meta">
                      <span>{project.discipline}</span>
                      <span className="project-year">{project.year}</span>
                    </p>
                    <h3>{project.title}</h3>

                    <div className="project-actions">
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpenProto(project.id)}>
                        <Play aria-hidden="true" />
                        Try the prototype
                      </button>
                      <a className="project-link" href="#contact">
                        Discuss
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section about" id="about">
          <div className="shell">
            <Reveal className="about-card">
              <div className="portrait">
                <img src="/assets/about/anjana-professional.png" alt="Anjana Rodrigo" loading="lazy" />
              </div>

              <div className="about-copy">
                <SectionHeading eyebrow="About Anjana">
                  Engineering insight, built into every <em>digital solution.</em>
                </SectionHeading>

                <p>Mining engineering + software + data — tools for real operations.</p>

                <ul className="tag-row">
                  <li>Mining Systems</li>
                  <li>Full-Stack Development</li>
                  <li>Operational Analytics</li>
                </ul>

                <a className="btn btn-primary" href="#experience">
                  See the experience
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>

              <Contours />
            </Reveal>
          </div>
        </section>

        <section className="section experience" id="experience">
          <div className="shell experience-grid">
            <Reveal className="panel timeline-panel">
              <SectionHeading eyebrow="Experience">
                Built across engineering, products, and <em>operations.</em>
              </SectionHeading>

              <ol className="timeline">
                {roles.map((item) => (
                  <li key={item.role}>
                    <span className={`timeline-node ${item.current ? "is-current" : ""}`} aria-hidden="true" />
                    <p className="timeline-period">{item.period}</p>
                    <h3>{item.role}</h3>
                    <p className="timeline-org">{item.org}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="panel expertise-panel" step={1}>
              <p className="eyebrow">
                <i aria-hidden="true" />
                Expertise
              </p>

              <ul className="expertise-grid">
                {expertise.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.label}>
                      <span>
                        <Icon aria-hidden="true" />
                      </span>
                      <strong>{item.label}</strong>
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="section credentials" id="credentials">
          <div className="shell">
            <Reveal className="heading-row">
              <SectionHeading eyebrow="Credentials">
                Education &amp; <em>professional standing.</em>
              </SectionHeading>
            </Reveal>

            <div className="credential-grid">
              {credentials.map((item, index) => {
                const Icon = item.icon
                return (
                  <Reveal as="article" className="credential-card" key={item.institution} step={index}>
                    <span className="credential-icon">
                      <Icon />
                    </span>
                    <h3>{item.institution}</h3>
                    <p>{item.detail}</p>
                    <p className="credential-period">{item.period}</p>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="shell">
            <Reveal className="contact-card">
              <svg className="wire-terrain" viewBox="0 0 500 260" aria-hidden="true" focusable="false" preserveAspectRatio="none">
                <path d="M10 225 96 111 151 172 235 43 302 131 366 76 490 225M10 225h480M96 111l139 114M151 172l84-129 131 182M235 43l67 88 64-55M96 111l55 61 151-41 64-55M151 172l151-41 64 94" />
              </svg>

              <div className="contact-copy">
                <p className="eyebrow">
                  <i aria-hidden="true" />
                  Let&apos;s build something useful
                </p>
                <h2>
                  Have a mining challenge <em>worth solving?</em>
                </h2>
                <p className="contact-lede">Tell me about your operation.</p>

                <div className="contact-actions">
                  <a
                    className="btn btn-invert btn-lg"
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Chat on WhatsApp
                    <ArrowRight aria-hidden="true" />
                  </a>
                  <a className="contact-email" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                  <a
                    className="contact-email"
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="contact-visual" aria-hidden="true">
                <div className="mini-dash">
                  <div className="mini-dash-head">
                    <span>Production overview</span>
                    <i />
                  </div>
                  <div className="mini-dash-stats">
                    <div>
                      <small>Production</small>
                      <strong>24,530</strong>
                    </div>
                    <div>
                      <small>Utilisation</small>
                      <strong>72%</strong>
                    </div>
                  </div>
                  <div className="mini-dash-bars">
                    {[52, 72, 43, 86, 65, 92, 70, 98].map((height, index) => (
                      <i key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <PrototypeDialog id={openProto} title={openProject?.title ?? ""} onClose={() => setOpenProto(null)} />

      <footer className="footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <img src="/assets/brand/ar-logo.png" alt="" width="44" height="44" />
            <p>
              Mining engineering.
              <br />
              Software precision.
              <br />
              Better decisions.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            <p className="footer-label">Navigate</p>
            {nav.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer-nav">
            <p className="footer-label">Elsewhere</p>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${contact.email}`}>Email</a>
            <a href={`tel:${contact.phoneRaw}`}>{contact.phone}</a>
          </div>

          <div className="footer-social">
            <a href={contact.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin aria-hidden="true" />
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github aria-hidden="true" />
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <MessageCircle aria-hidden="true" />
            </a>
            <a href={`mailto:${contact.email}`} aria-label="Email">
              <Mail aria-hidden="true" />
            </a>
            <a href={`tel:${contact.phoneRaw}`} aria-label="Phone">
              <Phone aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="shell footer-bottom">
          <span>© 2026 Anjana Rodrigo</span>
          <span>Engineering practical digital systems for real operations.</span>
        </div>
      </footer>
    </>
  )
}
