"use client"

import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MessageCircle, Phone, Volume2, VolumeX } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { about, experience, minebook, profile, research, software, softwareStack } from "@/lib/content"
import { sections } from "@/lib/sections"
import { setMuted, sound, unlock } from "@/lib/sound"
import { tour, useWorld } from "@/lib/store"

import { Panels } from "./Panels"
import { stepItem, travelTo } from "./scene/Rig"

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

/** Previous / Next and progress dots for a place that shows one thing at a time. */
function Stepper({ count, index }: { count: number; index: number }) {
  const set = useWorld((s) => s.set)
  return (
    <div className="mt-5 flex items-center gap-3">
      <button type="button" onClick={() => set({ sub: Math.max(0, index - 1) })} disabled={index === 0} className={ghost + " h-9 px-4 text-xs disabled:opacity-40"}>
        Previous
      </button>
      <div className="flex gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" aria-label={`Show item ${i + 1}`} onClick={() => set({ sub: i })} className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-forest" : "w-3 bg-forest/25"}`} />
        ))}
      </div>
      <button type="button" onClick={() => set({ sub: Math.min(count - 1, index + 1) })} disabled={index === count - 1} className={solid + " h-9 px-4 text-xs disabled:opacity-40"}>
        Next
      </button>
    </div>
  )
}

/**
 * Move one step through the story: the next item where a place shows several
 * (projects, roles, research steps), otherwise a teleport to the next place.
 */
function step(dir: 1 | -1) {
  const state = useWorld.getState()
  const here = state.active >= 0 ? state.active : tour.place
  if (state.active === here && stepItem(dir)) return 550
  const next = here + dir
  if (next < 0 || next >= sections.length) return 0
  // Going backward into a place with several items lands on its last one.
  travelTo(next, dir < 0 ? (sections[next].items ?? 1) - 1 : 0)
  return 1250
}

export default function Experience() {
  const root = useRef<HTMLDivElement>(null)
  const { active, ready, webgl, started, sub, panel, set } = useWorld()
  const [mute, setMute] = useState(false)

  // Sound: unlock on the first gesture, click on every button, chime on panels.
  useEffect(() => {
    const gesture = (e: Event) => {
      unlock()
      if (e.type === "pointerdown" && (e.target as HTMLElement).closest?.("button, a")) sound.click()
    }
    window.addEventListener("pointerdown", gesture)
    window.addEventListener("keydown", gesture)
    return () => {
      window.removeEventListener("pointerdown", gesture)
      window.removeEventListener("keydown", gesture)
    }
  }, [])
  useEffect(() => {
    if (panel) sound.open()
  }, [panel])

  useEffect(() => {
    // No WebGL (or ?lite): fall back to a plain, fully readable page.
    const c = document.createElement("canvas")
    const ok = Boolean(c.getContext("webgl2") ?? c.getContext("webgl")) && !new URLSearchParams(location.search).has("lite")
    if (!ok) {
      set({ webgl: false, ready: true })
      return
    }
    // One scroll, key press or swipe = one teleport. A short lock stops a single
    // gesture from skipping several places.
    let lock = 0
    const go = (dir: 1 | -1) => {
      const now = performance.now()
      if (now < lock) return
      const wait = step(dir)
      if (wait) lock = now + wait
    }
    const wheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest?.("aside")) return
      e.preventDefault()
      const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY
      if (Math.abs(dy) >= 8) go(dy > 0 ? 1 : -1)
    }
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (["arrowdown", "arrowright", "pagedown", " "].includes(k)) {
        e.preventDefault()
        go(1)
      } else if (["arrowup", "arrowleft", "pageup"].includes(k)) {
        e.preventDefault()
        go(-1)
      } else if (/^[1-7]$/.test(k) && !e.repeat) travelTo(Number(k) - 1)
      else if (k === "escape") set({ panel: null })
    }
    // Touch: swipe up for the next place, down for the previous one.
    let touch: { x: number; y: number } | null = null
    const touchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touch = (e.target as HTMLElement).closest?.("[data-ui]") ? null : { x: t.clientX, y: t.clientY }
    }
    const touchEnd = (e: TouchEvent) => {
      if (!touch) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touch.x
      const dy = t.clientY - touch.y
      touch = null
      if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.5) go(dy < 0 ? 1 : -1)
    }
    window.addEventListener("wheel", wheel, { passive: false })
    window.addEventListener("keydown", down)
    window.addEventListener("touchstart", touchStart, { passive: true })
    window.addEventListener("touchend", touchEnd, { passive: true })
    return () => {
      window.removeEventListener("wheel", wheel)
      window.removeEventListener("keydown", down)
      window.removeEventListener("touchstart", touchStart)
      window.removeEventListener("touchend", touchEnd)
    }
  }, [set])

  // The item on show in the place we are in (clamped: each place has its own count).
  const at = (n: number) => Math.min(sub, n - 1)
  const role = experience[at(experience.length)]
  const project = software[at(software.length)]
  const stepInfo = research.steps[at(research.steps.length)]
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
        <div className="flex items-center gap-2">
          {webgl ? (
            <button
              type="button"
              aria-pressed={mute}
              aria-label={mute ? "Turn sound on" : "Turn sound off"}
              onClick={() => {
                setMuted(!mute)
                setMute(!mute)
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-forest/20 bg-white/60 text-forest backdrop-blur hover:bg-white/90"
            >
              {mute ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          ) : null}
          <button type="button" onClick={() => (webgl ? travelTo(sections.length - 1) : document.getElementById("contact")?.scrollIntoView())} className={solid + " h-9 px-4 text-xs"}>
            Let&apos;s talk
          </button>
        </div>
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
            <button type="button" className={solid} onClick={() => travelTo(1)}>
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
          <Kicker>Projects | {String(software.indexOf(project) + 1).padStart(2, "0")} of {String(software.length).padStart(2, "0")}</Kicker>
          {webgl ? (
            <div aria-live="polite" className="min-h-[150px]">
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{project.title}</h2>
              <p className="mt-2 text-sm font-medium text-forest">{project.meta}</p>
              <Lead>{project.line}</Lead>
              {project.url ? (
                <a className={solid + " mt-4 h-9 px-4 text-xs"} href={project.url} target="_blank" rel="noreferrer">
                  Open the live site <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          ) : (
            <>
              <h2 className="font-display text-4xl font-semibold tracking-tight">Software Engineering</h2>
              <ul className="mt-5 space-y-4">
                {software.map((p) => (
                  <li key={p.id}>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-forest">{p.meta}</p>
                    <p className="text-sm opacity-80">{p.line}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {webgl ? (
            <>
              <Stepper count={software.length} index={software.indexOf(project)} />
              <Hint>{project.action}. Scroll for the next project.</Hint>
            </>
          ) : null}
          <Meta items={softwareStack} />
        </Block>

        <Block index={3}>
          <Kicker>Career | {String(experience.indexOf(role) + 1).padStart(2, "0")} of {String(experience.length).padStart(2, "0")}</Kicker>
          {webgl ? (
            <div className="min-h-[150px]" aria-live="polite">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{role.role}</h2>
              <p className="mt-2 text-sm font-medium text-forest">
                {role.org} | {role.period}
              </p>
              <Lead>{role.line}</Lead>
            </div>
          ) : (
            <>
              <h2 className="font-display text-4xl font-semibold tracking-tight">Professional Experience</h2>
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
            </>
          )}
          {webgl ? (
            <>
              <Stepper count={experience.length} index={experience.indexOf(role)} />
              <Hint>Scroll for the next role.</Hint>
            </>
          ) : null}
        </Block>

        <Block index={4} wide>
          <Kicker>Published research | Step {research.steps.indexOf(stepInfo) + 1} of {research.steps.length}</Kicker>
          {webgl ? (
            <div className="min-h-[150px]" aria-live="polite">
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{stepInfo.title}</h2>
              <Lead>{stepInfo.line}</Lead>
            </div>
          ) : (
            <>
              <h2 className="font-display text-4xl font-semibold tracking-tight">Research and Innovation</h2>
              <ol className="mt-5 space-y-3">
                {research.steps.map((st) => (
                  <li key={st.id}>
                    <p className="font-semibold">{st.title}</p>
                    <p className="text-sm opacity-80">{st.line}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
          {webgl ? <Stepper count={research.steps.length} index={research.steps.indexOf(stepInfo)} /> : null}
          <p className="mt-5 text-xs font-medium leading-snug opacity-80">{research.title}</p>
          <div className="mt-4 flex flex-wrap gap-3">
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
          <p
            data-ui
            className={`pointer-events-none fixed bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-[11px] font-medium text-charcoal backdrop-blur transition-opacity [@media(pointer:fine)]:flex ${started && active > 0 ? "opacity-0" : "opacity-100"}`}
          >
            Scroll or press <Key>↓</Key> for the next place | drag to look around | <Key>1</Key>-<Key>7</Key> jump to a place
          </p>
          <p className={`pointer-events-none fixed bottom-6 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white/60 px-4 py-2 text-[11px] font-medium text-charcoal backdrop-blur transition-opacity [@media(pointer:coarse)]:block ${started && active > 0 ? "opacity-0" : "opacity-100"}`}>Swipe up for the next place | drag sideways to look</p>
        </>
      ) : null}
      <Panels />
    </div>
  )
}
