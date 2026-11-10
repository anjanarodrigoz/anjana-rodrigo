"use client"

import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useRef, type ReactNode } from "react"

import { about, experience, minebook, profile, research, software, softwareStack } from "@/lib/content"
import { sections } from "@/lib/sections"
import { input, useWorld } from "@/lib/store"

import { Panels } from "./Panels"
import { stepRole, travelTo } from "./scene/Rig"

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false })

/** Text for one place. In the 3D world it shows while the character stands there. */
function Block({ index, children, wide }: { index: number; children: ReactNode; wide?: boolean }) {
  const here = useWorld((s) => s.active === index && (index !== 0 || !s.started))
  const webgl = useWorld((s) => s.webgl)
  return (
    <section id={sections[index].id} aria-label={sections[index].nav} className={webgl ? "" : "border-b border-forest/10 px-6 py-16"}>
      <div
        data-ui
        className={[
          webgl
            ? "fixed left-4 right-4 top-16 z-20 max-h-[46vh] overflow-auto transition-all duration-500 sm:left-10 sm:right-auto sm:top-1/2 sm:max-h-none sm:-translate-y-1/2 sm:overflow-visible"
            : "mx-auto",
          wide ? "sm:max-w-[540px]" : "sm:max-w-[420px]",
          webgl && !here ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100",
          "text-charcoal",
        ].join(" ")}
        aria-hidden={webgl && !here}
      >
        {children}
      </div>
    </section>
  )
}

const Kicker = ({ children }: { children: ReactNode }) => <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest/70">{children}</p>
const Lead = ({ children }: { children: ReactNode }) => <p className="mt-4 text-[15px] leading-relaxed opacity-80">{children}</p>
const Meta = ({ items }: { items: string[] }) => <p className="mt-4 text-xs leading-relaxed opacity-70">{items.join(" | ")}</p>
const Hint = ({ children }: { children: ReactNode }) => (
  <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium opacity-80">
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-70" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
    </span>
    {children}
  </p>
)
const pill = "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition"
const solid = `${pill} bg-forest text-paper hover:bg-deep`
const ghost = `${pill} border border-forest/25 bg-white/50 backdrop-blur hover:bg-white/80`
const Key = ({ children }: { children: ReactNode }) => <kbd className="rounded-md border border-forest/20 bg-white/70 px-1.5 py-0.5 font-sans text-[11px] font-semibold">{children}</kbd>

/** On-screen joystick for touch devices. Push far to run. */
function Joystick() {
  const knob = useRef<HTMLDivElement>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const move = (e: React.PointerEvent) => {
    if (!origin.current) return
    const dx = e.clientX - origin.current.x
    const dy = e.clientY - origin.current.y
    const m = Math.hypot(dx, dy)
    const k = m > 44 ? 44 / m : 1
    input.x = (dx * k) / 44
    input.y = (-dy * k) / 44
    input.run = m > 40
    if (knob.current) knob.current.style.transform = `translate(${dx * k}px, ${dy * k}px)`
  }
  const end = () => {
    origin.current = null
    input.x = input.y = 0
    input.run = false
    if (knob.current) knob.current.style.transform = ""
  }
  return (
    <div
      data-ui
      role="application"
      aria-label="Joystick: drag to walk, push far to run"
      className="fixed bottom-6 left-6 z-30 hidden h-28 w-28 touch-none place-items-center rounded-full border border-white/70 bg-white/35 backdrop-blur [@media(pointer:coarse)]:grid"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        const r = e.currentTarget.getBoundingClientRect()
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        useWorld.getState().set({ started: true })
        move(e)
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div ref={knob} className="h-12 w-12 rounded-full bg-forest shadow-lg" />
    </div>
  )
}

export default function Experience() {
  const root = useRef<HTMLDivElement>(null)
  const { active, ready, webgl, started, roleIndex, set } = useWorld()

  useEffect(() => {
    // No WebGL (or ?lite): fall back to a plain, fully readable page.
    const c = document.createElement("canvas")
    const ok = Boolean(c.getContext("webgl2") ?? c.getContext("webgl")) && !new URLSearchParams(location.search).has("lite")
    if (!ok) {
      set({ webgl: false, ready: true })
      return
    }
    // Keyboard: WASD or arrows to walk, Shift to run, 1-7 to fast travel.
    const keys = new Set<string>()
    const sync = () => {
      input.x = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0)
      input.y = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0)
      input.run = keys.has("shift")
    }
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault()
      if (/^[1-7]$/.test(k) && !e.repeat) travelTo(Number(k) - 1)
      if (k === "escape") set({ panel: null })
      keys.add(k)
      sync()
    }
    const up = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase())
      sync()
    }
    const blur = () => {
      keys.clear()
      sync()
    }
    // Experience: one scroll moves exactly one stop along the path, then halts.
    let lock = 0
    const wheel = (e: WheelEvent) => {
      if (sections[useWorld.getState().active]?.id !== "experience") return
      if ((e.target as HTMLElement).closest?.("aside")) return
      e.preventDefault()
      const now = performance.now()
      if (now < lock || Math.abs(e.deltaY) < 8) return
      lock = now + 650
      stepRole(e.deltaY > 0 ? 1 : -1)
    }
    window.addEventListener("wheel", wheel, { passive: false })
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", blur)
    return () => {
      window.removeEventListener("wheel", wheel)
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", blur)
    }
  }, [set])

  const role = experience[roleIndex]
  const reading = active > 0 || (active === 0 && !started)

  return (
    <div ref={root} id="world-root" className={webgl ? "fixed inset-0 select-none overflow-hidden" : "bg-paper"}>
      {webgl ? <Scene eventSource={root} /> : null}
      {webgl ? (
        <>
          <div className={`scrim-light pointer-events-none fixed inset-0 z-10 transition-opacity duration-700 ${reading ? "opacity-100" : "opacity-0"}`} />
          <div className={`fixed inset-0 z-50 grid place-items-center bg-deep text-paper transition-opacity duration-1000 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}>
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-sage/30 border-t-sage" />
              <p className="font-display text-sm tracking-wide">Building the world</p>
            </div>
          </div>
        </>
      ) : null}

      <header data-ui className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-10">
        <button type="button" onClick={() => (webgl ? travelTo(0) : window.scrollTo({ top: 0 }))} className="font-display text-base font-semibold tracking-tight text-charcoal">
          Anjana Rodrigo
        </button>
        <button type="button" onClick={() => (webgl ? travelTo(sections.length - 1) : document.getElementById("contact")?.scrollIntoView())} className={solid + " h-9 px-4 text-xs"}>
          Let&apos;s talk
        </button>
      </header>

      {webgl ? (
        <nav data-ui aria-label="Fast travel" className="fixed right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-1.5 sm:right-5">
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => travelTo(i)}
              aria-current={active === i ? "location" : undefined}
              className={`group flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-[11px] font-semibold transition ${active === i ? "bg-forest text-paper" : "bg-white/55 text-charcoal backdrop-blur hover:bg-white/90"}`}
            >
              <span className="hidden sm:inline">{s.nav}</span>
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${active === i ? "bg-paper text-forest" : "bg-forest/10"}`}>{i + 1}</span>
            </button>
          ))}
        </nav>
      ) : null}

      <main>
        <Block index={0} wide>
          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">Hi, I&apos;m {profile.name}.</h1>
          <p className="mt-4 font-display text-xl font-medium text-forest sm:text-2xl">{profile.tagline}</p>
          <p className="mt-3 text-sm font-medium opacity-75">{profile.roles}</p>
          <Lead>{profile.intro}</Lead>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className={solid} onClick={() => set({ started: true })}>
              Explore My World <ArrowDown className="h-4 w-4" />
            </button>
            <button type="button" className={ghost} onClick={() => travelTo(2)}>
              View Projects
            </button>
          </div>
        </Block>

        <Block index={1}>
          <Kicker>Founder</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">MineBook</h2>
          <Lead>{minebook.line}</Lead>
          <Meta items={minebook.manages} />
          {webgl ? <Hint>Select the haul truck, the site office or the staked bench in the pit.</Hint> : null}
          <div className="mt-6">
            <a className={solid} href={minebook.url} target="_blank" rel="noreferrer">
              minebook.lk <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Block>

        <Block index={2}>
          <Kicker>Projects</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Software Engineering</h2>
          <Lead>Web platforms and mobile apps for mining and construction: MineBook, Fleet Dispatch, Mining Cycle-Time, Crack Survey and Blast Pattern Design.</Lead>
          <Meta items={softwareStack} />
          {/* Every project is also a button here, so nobody has to guess. */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {software.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => set({ panel: { kind: "project", project: p } })} className="inline-flex items-center gap-1.5 rounded-full border border-forest/25 bg-white/70 px-3.5 py-2 text-xs font-semibold text-forest backdrop-blur transition hover:bg-forest hover:text-paper">
                  {p.title} <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          {webgl ? <Hint>Select a project here, or click any device in the world.</Hint> : null}
        </Block>

        <Block index={3}>
          <Kicker>Career</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Professional Experience</h2>
          {webgl ? (
            <div className="mt-5 min-h-[120px]" aria-live="polite">
              <p className="font-display text-xl font-semibold">{role.role}</p>
              <p className="mt-1 text-sm font-medium text-forest">
                {role.org} | {role.period}
              </p>
              <Lead>{role.line}</Lead>
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {experience.map((r) => (
                <li key={r.id}>
                  <p className="font-semibold">{r.role}</p>
                  <p className="text-sm text-forest">
                    {r.org} | {r.period}
                  </p>
                  <p className="text-sm opacity-80">{r.line}</p>
                </li>
              ))}
            </ul>
          )}
          {webgl ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={() => stepRole(-1)} disabled={roleIndex === 0} className={ghost + " h-9 px-4 text-xs disabled:opacity-40"}>
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {experience.map((r, i) => (
                    <span key={r.id} className={`h-1.5 rounded-full transition-all ${i === roleIndex ? "w-8 bg-forest" : "w-3 bg-forest/25"}`} />
                  ))}
                </div>
                <button type="button" onClick={() => stepRole(1)} disabled={roleIndex === experience.length - 1} className={solid + " h-9 px-4 text-xs disabled:opacity-40"}>
                  Next
                </button>
              </div>
              <Hint>Scroll to step from one role to the next.</Hint>
            </>
          ) : null}
        </Block>

        <Block index={4} wide>
          <Kicker>Published research</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Research and Innovation</h2>
          <p className="mt-5 font-display text-lg font-medium leading-snug">{research.title}</p>
          <Meta items={[research.venue, research.detail]} />
          <Lead>{research.line}</Lead>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className={solid} href={research.url} target="_blank" rel="noreferrer">
              Read on IEEE Xplore <ArrowUpRight className="h-4 w-4" />
            </a>
            {webgl ? (
              <button type="button" className={ghost} onClick={() => set({ panel: { kind: "paper" } })}>
                Authors and details
              </button>
            ) : null}
          </div>
        </Block>

        <Block index={5}>
          <Kicker>About</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">An engineer who builds.</h2>
          <Lead>{about.line}</Lead>
          <ul className="mt-5 space-y-1.5 text-xs opacity-75">
            {about.credentials.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Block>

        <Block index={6}>
          <Kicker>Contact</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Let&apos;s build something useful.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className={solid} href={profile.whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a className={ghost} href={`mailto:${profile.email}`}>
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-forest" />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-forest" />
              <a href={`tel:${profile.phoneRaw}`}>{profile.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-forest" />
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </li>
            <li className="flex items-center gap-2">
              <Github className="h-4 w-4 text-forest" />
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
            </li>
          </ul>
          <p className="mt-8 text-[11px] opacity-50">© 2026 Anjana Rodrigo</p>
        </Block>
      </main>

      {webgl ? (
        <>
          <Joystick />
          <p
            data-ui
            className={`pointer-events-none fixed bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-[11px] font-medium text-charcoal backdrop-blur transition-opacity [@media(pointer:fine)]:flex ${started && active > 0 ? "opacity-0" : "opacity-100"}`}
          >
            <Key>W</Key>
            <Key>A</Key>
            <Key>S</Key>
            <Key>D</Key> walk | <Key>Shift</Key> run | drag to look | <Key>1</Key>-<Key>7</Key> fast travel
          </p>
          <p className="pointer-events-none fixed bottom-8 right-6 z-20 hidden text-[11px] font-medium text-charcoal/70 [@media(pointer:coarse)]:block">Drag to look | push far to run</p>
        </>
      ) : null}
      <Panels />
    </div>
  )
}
