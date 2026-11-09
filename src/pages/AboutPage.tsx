import { Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react"

import { capabilities, contact, credentials, expertise, roles } from "@/content"

import { PageShell } from "./PageShell"

export function AboutPage() {
  return (
    <PageShell back="office" backLabel="Back to the site office">
      <section className="about-head">
        <img src="/assets/about/anjana-professional.png" alt="Anjana Rodrigo" width="1023" height="1537" />
        <div>
          <p className="tag">About me</p>
          <h1 className="page-title">Anjana Rodrigo</h1>
          <p className="page-lead">
            Mining engineer and software developer. I combine mining engineering, software and data to build tools
            that solve real operational problems.
          </p>
          <ul className="contact-row">
            <li>
              <a href={contact.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`}>
                <Mail aria-hidden="true" /> {contact.email}
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneRaw}`}>
                <Phone aria-hidden="true" /> {contact.phone}
              </a>
            </li>
            <li>
              <a href={contact.linkedin} target="_blank" rel="noreferrer">
                <Linkedin aria-hidden="true" /> LinkedIn
              </a>
            </li>
            <li>
              <a href={contact.github} target="_blank" rel="noreferrer">
                <Github aria-hidden="true" /> GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="facts" aria-label="What I do">
        {capabilities.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.title}>
              <Icon aria-hidden="true" className="fact-icon" />
              <h2>{c.title}</h2>
              <p>{c.copy}</p>
            </div>
          )
        })}
      </section>

      <section className="block">
        <h2 className="block-title">Experience</h2>
        <ol className="timeline">
          {roles.map((r) => (
            <li key={r.role} className={r.current ? "is-current" : undefined}>
              <span>{r.period}</span>
              <strong>{r.role}</strong>
              <em>{r.org}</em>
              <p>{r.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2 className="block-title">Credentials</h2>
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
      </section>

      <section className="block">
        <h2 className="block-title">Expertise</h2>
        <ul className="chips">
          {expertise.map((e) => {
            const Icon = e.icon
            return (
              <li key={e.label}>
                <Icon aria-hidden="true" />
                {e.label}
              </li>
            )
          })}
        </ul>
      </section>
    </PageShell>
  )
}
