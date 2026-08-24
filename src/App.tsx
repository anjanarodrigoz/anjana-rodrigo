import type { ReactNode } from "react"
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react"

import { Header } from "@/components/site/Header"
import { Reveal } from "@/components/site/Reveal"
import { capabilities, contact, credentials, expertise, nav, process, projects, roles } from "@/content"

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
  return (
    <>
      <Header />

      <main>
        <section className="hero" id="home">
          <div className="hero-field" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />

          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="status-chip">
                <i aria-hidden="true" />
                Open to consulting work
              </p>

              <h1>
                Engineering smarter <em>mining operations.</em>
              </h1>

              <p className="hero-lede">
                I pair mining engineering judgement with software precision, building the tools that
                turn pit floor complexity into decisions teams can act on.
              </p>

              <div className="hero-actions">
                <a className="btn btn-primary btn-lg" href="#work">
                  Explore selected work
                  <ArrowRight aria-hidden="true" />
                </a>
                <a className="btn btn-ghost btn-lg" href="#about">
                  About Anjana
                </a>
              </div>

              <dl className="hero-proof">
                <div>
                  <dt>Discipline</dt>
                  <dd>Earth Resources Eng.</dd>
                </div>
                <div>
                  <dt>Building since</dt>
                  <dd>2020</dd>
                </div>
                <div>
                  <dt>Focus</dt>
                  <dd>Operations intelligence</dd>
                </div>
              </dl>
            </div>

            <div className="hero-visual">
              <div className="hero-mine">
                <img
                  src="/assets/hero/floating-mine-summary-transparent-v4.png"
                  alt="Isometric open-pit mine with live readouts for drill availability, active fleet, and plant throughput"
                  width="1672"
                  height="941"
                />
                <div className="hero-mine-shadow" aria-hidden="true" />
              </div>

              <div className="hero-figure">
                <img
                  src="/assets/hero/mining-engineer-tablet-white.png"
                  alt="Mining engineer in a hard hat and high-visibility vest, holding a tablet"
                  width="979"
                  height="1606"
                />
                <div className="hero-figure-shadow" aria-hidden="true" />
              </div>
            </div>
          </div>

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
                    <p>{item.copy}</p>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="section work" id="work">
          <div className="shell">
            <Reveal className="heading-row">
              <SectionHeading eyebrow="Selected work">
                Projects designed for <em>real operations.</em>
              </SectionHeading>
              <p className="heading-row-lede">
                Practical products shaped by engineering context, real user workflows, and
                measurable operational outcomes.
              </p>
            </Reveal>

            <div className="project-grid">
              {projects.map((project, index) => (
                <Reveal
                  as="article"
                  key={project.title}
                  step={index}
                  className={`project-card ${project.featured ? "is-featured" : ""} ${project.tone}`}
                >
                  <div className="project-media">
                    <img src={project.image} alt={`${project.title} interface`} loading="lazy" />
                  </div>

                  <div className="project-body">
                    <p className="project-meta">
                      <span>{project.discipline}</span>
                      <span className="project-year">{project.year}</span>
                    </p>
                    <h3>{project.title}</h3>
                    <p className="project-copy">{project.copy}</p>

                    <a className="project-link" href="#contact">
                      Discuss this project
                      <ArrowUpRight aria-hidden="true" />
                    </a>
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

                <p>
                  I combine mining engineering knowledge with software development and data analytics
                  to build tools that solve real operational challenges, not generic dashboards.
                </p>
                <p>
                  From mine planning and production intelligence to mobile field systems, I focus on
                  solutions that help teams work smarter, decide faster, and deliver measurable
                  results.
                </p>

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
                    <p className="timeline-copy">{item.copy}</p>
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
              <p className="heading-row-lede">
                Formal engineering training, published research, and professional membership in two
                jurisdictions.
              </p>
            </Reveal>

            <div className="credential-grid">
              {credentials.map((item, index) => {
                const Icon = item.icon
                return (
                  <Reveal as="article" className="credential-card" key={item.institution} step={index}>
                    <span className={`credential-icon ${item.accent}`}>
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

        <section className="section process">
          <div className="shell">
            <Reveal>
              <SectionHeading
                eyebrow="How I work"
                align="center"
                lede="A short, repeatable path from an operational problem to a tool people actually use."
              >
                From operational problem to <em>practical product.</em>
              </SectionHeading>
            </Reveal>

            <ol className="process-grid">
              {process.map((item, index) => {
                const Icon = item.icon
                return (
                  <Reveal as="li" key={item.title} step={index}>
                    <span className="process-node">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="mono-index">{item.index}</span>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </Reveal>
                )
              })}
            </ol>
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
                <p className="contact-lede">
                  Tell me about the operation and the decision you&apos;re trying to make. I&apos;ll
                  tell you honestly whether software is the answer.
                </p>

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
