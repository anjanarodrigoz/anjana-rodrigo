import type { ReactNode } from "react"
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Briefcase,
  ChevronRight,
  Code2,
  Compass,
  DatabaseZap,
  Github,
  Layers3,
  LineChart,
  Linkedin,
  Mail,
  Menu,
  Hammer,
  Route,
  ScanSearch,
  Sparkles,
  Target,
  UsersRound,
  Wrench,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const nav = [
  ["Home", "#home"],
  ["Work", "#work"],
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Contact", "#contact"],
]

const projects = [
  {
    title: "MineBook",
    label: "Product Design · Data Platform",
    copy: "A connected operations platform for production, equipment, alerts, and reporting.",
    image: "/assets/projects/minebook.png",
    tone: "dark",
  },
  {
    title: "Fleet Dispatch",
    label: "Mining Systems · Software",
    copy: "Live fleet allocation, route intelligence, and operational job coordination.",
    image: "/assets/projects/fleet-dispatch.png",
    tone: "light",
  },
  {
    title: "Mining Cycle-Time",
    label: "Analytics · Decision Support",
    copy: "Clear cycle analysis that exposes delays and improves equipment productivity.",
    image: "/assets/projects/cycle-time.png",
    tone: "light",
  },
]

const roles = [
  {
    role: "Team Leader, MIS Development",
    org: "University of Moratuwa",
    period: "2024—Present",
    copy: "Leading practical information systems that improve university workflows and visibility.",
  },
  {
    role: "Software Engineering Consultant",
    org: "Idea8",
    period: "2024—Present",
    copy: "Designing reliable software products and translating operational needs into usable systems.",
  },
  {
    role: "Mobile Application Developer",
    org: "Melbourne Mover",
    period: "2020—2024",
    copy: "Built customer and field workflows for transport booking, dispatch, and live job tracking.",
  },
]

const expertise = [
  ["Mine Planning", Hammer],
  ["Fleet Systems", Route],
  ["Web Applications", Code2],
  ["Data Visualisation", BarChart3],
  ["Process Improvement", Wrench],
  ["Technical Leadership", UsersRound],
]

const process = [
  ["01", "Discover", ScanSearch, "Understand the operational challenge and define clear objectives."],
  ["02", "Model", Boxes, "Map the data, workflows, constraints, and practical solution path."],
  ["03", "Build", Code2, "Develop intuitive tools with the people who will actually use them."],
  ["04", "Improve", LineChart, "Measure performance, learn continuously, and improve the system."],
]

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="Anjana Rodrigo home">
      <img src="/assets/brand/ar-logo.png" alt="AR" width="58" height="58" />
    </a>
  )
}

function SectionHeading({ eyebrow, children, align = "left" }: { eyebrow: string; children: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{children}</h2>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="nav-shell">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {nav.map(([label, href], index) => (
              <a className={index === 0 ? "active" : ""} href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
          <Button asChild className="button button-small header-cta">
            <a href="#contact">Let&apos;s Talk <span className="button-icon"><ArrowRight /></span></a>
          </Button>
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><Menu /></summary>
            <div className="mobile-menu-panel">
              <div className="mobile-menu-top"><Brand /><X /></div>
              {nav.map(([label, href]) => <a href={href} key={href}>{label}<ChevronRight /></a>)}
            </div>
          </details>
        </div>
      </header>

      <main>
        <section className="hero section-pad" id="home">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="page-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow hero-name">ANJANA RODRIGO</p>
              <h1>Engineering smarter <span>mining operations.</span></h1>
              <div className="headline-rule" />
              <p className="hero-lede">Mining knowledge. Software precision.<br />Better operational decisions.</p>
              <div className="hero-actions">
                <Button asChild className="button"><a href="#work">Explore Selected Work <ArrowRight /></a></Button>
                <Button asChild variant="outline" className="button button-secondary"><a href="#about">About Anjana <ArrowRight /></a></Button>
              </div>
            </div>

            <div className="hero-visual" aria-label="Digital mining operations illustration">
              <div className="network-line line-one"><i /><i /></div>
              <div className="network-line line-two"><i /><i /></div>
              <div className="mine-wrap">
                <img
                  src="/assets/hero/floating-mine.png"
                  alt="Floating open-pit mine model with haul trucks and processing plant"
                />
                <div className="mine-shadow" />
              </div>
              <div className="character-wrap">
                <img
                  src="/assets/hero/mining-engineer-tablet-white.png"
                  alt="Cartoon mining engineer wearing safety equipment and holding a tablet"
                />
              </div>

              <article className="metric-card production-card">
                <span className="metric-label"><i />Production Today</span>
                <strong>24,530 <small>t</small></strong>
                <svg viewBox="0 0 140 36" aria-hidden="true"><path d="M2 29 19 24 36 28 53 17 72 21 92 8 110 14 138 3" /></svg>
              </article>
              <article className="metric-card utilisation-card">
                <span className="metric-label"><i />Equipment Utilisation</span>
                <div className="donut-row"><span className="donut" /><strong>72<small>%</small></strong></div>
              </article>
              <article className="metric-card fleet-card">
                <span className="metric-label"><i />Active Fleet</span>
                <strong>12 <small>of 16</small></strong>
                <span className="progress"><i /></span>
              </article>
              <article className="metric-card cycle-card">
                <span className="metric-label"><i />Cycle Time</span>
                <strong>18.4 <small>min</small></strong>
                <svg viewBox="0 0 140 36" aria-hidden="true"><path d="M2 18 22 25 40 19 59 8 78 14 100 19 118 11 138 3" /></svg>
              </article>
            </div>
          </div>

          <div className="page-shell capability-grid">
            <article><span><Hammer /></span><div><h3>Mining Engineering</h3><p>Designing efficient mine plans, infrastructure, and operational strategies.</p></div><ArrowRight /></article>
            <article><span><Code2 /></span><div><h3>Software Development</h3><p>Building intuitive tools and data platforms that turn complexity into clarity.</p></div><ArrowRight /></article>
            <article><span><BarChart3 /></span><div><h3>Data &amp; Analytics</h3><p>Transforming data into actionable insights that drive performance.</p></div><ArrowRight /></article>
          </div>
        </section>

        <section className="impact section-pad-small" aria-label="Impact statistics">
          <div className="page-shell impact-grid">
            <div><span><UsersRound /></span><strong>8+</strong><small>Years Experience</small></div>
            <div><span><Briefcase /></span><strong>20+</strong><small>Projects</small></div>
            <div><span><Layers3 /></span><strong>3</strong><small>Core Disciplines</small></div>
            <div><span><Target /></span><strong>Operational</strong><small>Focus</small></div>
          </div>
        </section>

        <section className="about section-pad" id="about">
          <div className="page-shell about-card">
            <div className="portrait-frame">
              <img src="/assets/about/anjana-professional.png" alt="Anjana Rodrigo" loading="lazy" />
              <div className="portrait-badge"><Sparkles /><span><strong>Mining × Software</strong><small>One practical perspective</small></span></div>
            </div>
            <div className="about-copy">
              <SectionHeading eyebrow="ABOUT ANJANA">Engineering insight, built into every <span>digital solution.</span></SectionHeading>
              <p>I combine mining engineering knowledge with software development and data analytics to build tools that solve real operational challenges.</p>
              <p>From mine planning and production intelligence to mobile field systems, I focus on solutions that help teams work smarter, make better decisions, and deliver measurable results.</p>
              <div className="skill-pills">
                <Badge variant="outline"><Hammer />Mining Systems</Badge>
                <Badge variant="outline"><Code2 />Full-Stack Development</Badge>
                <Badge variant="outline"><DatabaseZap />Operational Analytics</Badge>
              </div>
              <Button asChild className="button"><a href="#experience">More About Me <ArrowRight /></a></Button>
            </div>
            <div className="contours" aria-hidden="true"><i /><i /><i /><i /></div>
          </div>
        </section>

        <section className="work section-pad" id="work">
          <div className="page-shell">
            <div className="work-heading-row">
              <SectionHeading eyebrow="SELECTED WORK">Projects designed for <span>real operations.</span></SectionHeading>
              <p>Practical products shaped by engineering context, user needs, and measurable operational outcomes.</p>
            </div>
            <div className="project-grid">
              {projects.map((project, index) => (
                <Card className={`project-card project-${index + 1} ${project.tone}`} key={project.title}>
                  <div className="project-image">
                    <img src={project.image} alt={`${project.title} product interface`} loading="lazy" />
                  </div>
                  <div className="project-content">
                    <Badge variant="outline" className="project-label">{project.label}</Badge>
                    <h3>{project.title}</h3>
                    <p>{project.copy}</p>
                    <a href="#contact" aria-label={`Discuss ${project.title}`}><ArrowRight /></a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="experience section-pad" id="experience">
          <div className="page-shell experience-grid">
            <div className="timeline-panel">
              <SectionHeading eyebrow="EXPERIENCE">Built across engineering, products, and <span>operations.</span></SectionHeading>
              <div className="timeline">
                {roles.map((item) => (
                  <article key={item.role}>
                    <i className="timeline-node" />
                    <div className="timeline-top"><div><h3>{item.role}</h3><p>{item.org}</p></div><span>{item.period}</span></div>
                    <p>{item.copy}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="expertise-panel">
              <p className="eyebrow">EXPERTISE</p>
              <div className="expertise-grid">
                {expertise.map(([label, Icon]) => (
                  <article key={label as string}><span><Icon /></span><strong>{label as string}</strong></article>
                ))}
              </div>
              <div className="education-card">
                <span><Compass /></span>
                <div><small>EDUCATION</small><strong>BScEng (Hons)</strong><p>Earth Resources Engineering<br />University of Moratuwa</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="process section-pad">
          <div className="page-shell">
            <SectionHeading eyebrow="HOW I WORK" align="center">From operational problem to <span>practical product.</span></SectionHeading>
            <div className="process-grid">
              {process.map(([number, title, Icon, copy]) => (
                <article key={title as string}>
                  <div className="process-top"><small>{number as string}</small><span><Icon /></span></div>
                  <h3>{title as string}</h3><p>{copy as string}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact">
          <div className="page-shell contact-card">
            <div className="contact-copy">
              <p className="eyebrow">LET&apos;S BUILD SOMETHING USEFUL</p>
              <h2>Have a mining challenge <span>worth solving?</span></h2>
              <p>Let&apos;s turn your operational challenge into a smart, data-driven solution that delivers real impact.</p>
              <Button asChild className="button button-white"><a href="mailto:anjanarodrigoz@gmail.com">Start a Conversation <ArrowRight /></a></Button>
            </div>
            <div className="contact-visual" aria-hidden="true">
              <div className="wire-mountain"><svg viewBox="0 0 500 260"><path d="M10 225 96 111 151 172 235 43 302 131 366 76 490 225M10 225h480M96 111l139 114M151 172l84-129 131 182M235 43l67 88 64-55M96 111l55 61 151-41 64-55M151 172l151-41 64 94" /></svg></div>
              <div className="tablet-panel"><div className="tablet-head"><span>Production Overview</span><i /></div><div className="tablet-stats"><span><small>Production</small><strong>24,530</strong></span><span><small>Utilisation</small><strong>72%</strong></span></div><div className="tablet-bars">{[52, 72, 43, 86, 65, 92, 70, 98].map((h, i) => <i key={i} style={{height: `${h}%`}} />)}</div></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="page-shell footer-grid">
          <div className="footer-brand"><Brand /><p>Mining engineering.<br />Software precision.<br />Better decisions.</p></div>
          <div className="footer-links">{nav.slice(0, 4).map(([label, href]) => <a href={href} key={href}>{label}</a>)}</div>
          <div className="footer-links">{nav.slice(4).map(([label, href]) => <a href={href} key={href}>{label}</a>)}<a href="mailto:anjanarodrigoz@gmail.com">Email</a></div>
          <div className="social-links"><a href="https://linkedin.com/in/anjana-rodrigo-a41539191" aria-label="LinkedIn"><Linkedin /></a><a href="https://github.com/anjanarodrigoz" aria-label="GitHub"><Github /></a><a href="mailto:anjanarodrigoz@gmail.com" aria-label="Email"><Mail /></a></div>
        </div>
        <div className="page-shell footer-bottom"><span>© 2026 Anjana Rodrigo</span><span>Engineering practical digital systems for real operations.</span></div>
      </footer>
    </>
  )
}
