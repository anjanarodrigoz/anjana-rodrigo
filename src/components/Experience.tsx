"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useRef, type ReactNode } from "react"

import { about, crackSurvey, experience, minebook, profile, research, softwareStack } from "@/lib/content"
import { ARRIVE, HOLD, LEAVE, WORLD_ORIGIN, sections, type Pose } from "@/lib/sections"
import { rig, useWorld } from "@/lib/store"

import { Panels } from "./Panels"

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false })

const DARK = new Set([2, 5])

/** Flatten a pose into rig properties in universe coordinates. */
const at = (i: number, pose: Pose) => {
  const o = WORLD_ORIGIN[sections[i].world]
  return {
    px: o[0] + pose.pos[0], py: o[1] + pose.pos[1], pz: o[2] + pose.pos[2],
    lx: o[0] + pose.look[0], ly: o[1] + pose.look[1], lz: o[2] + pose.look[2],
  }
}

/**
 * Build the master scroll timeline: one unit of time per section.
 *   0 .. HOLD        the camera drifts from pose A to B while you read
 *   HOLD .. LEAVE    it closes in on the character, who dissolves
 *   LEAVE .. ARRIVE  a soft veil hides the jump to the next world
 *   ARRIVE .. 1      the next world assembles and the character reappears
 * Same-world moves ("fly") skip the veil and sweep the camera instead.
 */
function buildTimeline(trigger: HTMLElement) {
  const tl = gsap.timeline({
    defaults: { ease: "none", immediateRender: false },
    scrollTrigger: { trigger, start: "top top", end: "bottom bottom", scrub: 0.9 },
    onUpdate: () => {
      rig.time = tl.time()
    },
  })
  Object.assign(rig, at(0, sections[0].a))

  sections.forEach((s, i) => {
    const next = sections[i + 1]
    if (!next) {
      tl.fromTo(rig, at(i, s.a), { ...at(i, s.b), duration: 1, ease: "sine.inOut" }, i)
      return
    }
    tl.fromTo(rig, at(i, s.a), { ...at(i, s.b), duration: HOLD, ease: "sine.inOut" }, i)

    if (s.exit === "fly") {
      // Dissolve, sweep through the world, reappear at the new spot.
      tl.fromTo(rig, { dissolve: 0 }, { dissolve: 1, duration: 0.1, ease: "power2.in" }, i + HOLD)
      tl.fromTo(rig, at(i, s.b), { ...at(i + 1, next.a), duration: 1 - HOLD, ease: "power2.inOut" }, i + HOLD)
      tl.fromTo(rig, { dissolve: 1 }, { dissolve: 0, duration: 0.1, ease: "power2.out" }, i + ARRIVE)
      return
    }

    // Teleport: dolly to the character, dissolve, veil, jump, assemble.
    tl.fromTo(rig, at(i, s.b), { ...at(i, s.c), duration: LEAVE - HOLD, ease: "power2.inOut" }, i + HOLD)
    tl.fromTo(rig, { dissolve: 0 }, { dissolve: 1, duration: 0.1, ease: "power1.in" }, i + HOLD + 0.03)
    tl.fromTo(rig, { veil: 0 }, { veil: 1, duration: 0.07 }, i + LEAVE - 0.03)
    tl.fromTo(rig, { veil: 1 }, { veil: 0, duration: 0.08 }, i + ARRIVE)
    // Arrive from a little further back and higher, settling into pose A.
    const a = at(i + 1, next.a)
    const pre = { ...a, px: a.px + (a.px - a.lx) * 0.35, py: a.py + 3.5, pz: a.pz + (a.pz - a.lz) * 0.35 }
    tl.fromTo(rig, pre, { ...a, duration: 1 - ARRIVE, ease: "power3.out" }, i + ARRIVE)
    tl.fromTo(rig, { dissolve: 1 }, { dissolve: 0, duration: 0.09, ease: "power2.out" }, i + ARRIVE + 0.02)
    if (next.world !== "mine") {
      tl.fromTo(rig.asm, { [next.world]: 0 }, { [next.world]: 1, duration: 0.3, ease: "power1.out" }, i + ARRIVE - 0.02)
    }
  })
  return tl
}

const goTo = (i: number, f = 0.2) => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({ top: ((i + f) / sections.length) * max, behavior: "smooth" })
}

function Block({ index, children, wide }: { index: number; children: ReactNode; wide?: boolean }) {
  const active = useWorld((s) => s.active === index)
  const webgl = useWorld((s) => s.webgl)
  const dark = DARK.has(index) && webgl
  return (
    <section id={sections[index].id} aria-label={sections[index].nav} className={webgl ? "h-[300vh]" : "border-b border-forest/10 px-6 py-16"}>
      <div
        data-ui
        className={[
          webgl ? "fixed bottom-16 left-5 right-5 z-20 transition-all duration-500 sm:bottom-auto sm:left-10 sm:right-auto sm:top-1/2 sm:-translate-y-1/2" : "mx-auto",
          wide ? "sm:max-w-[560px]" : "sm:max-w-[440px]",
          webgl && !active ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100",
          dark ? "text-paper" : "text-charcoal",
        ].join(" ")}
        aria-hidden={webgl && !active}
      >
        {children}
      </div>
    </section>
  )
}

const Kicker = ({ children }: { children: ReactNode }) => <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sage">{children}</p>
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
const ghost = `${pill} border border-current/25 bg-white/40 backdrop-blur hover:bg-white/70`

export default function Experience() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const { active, ready, webgl, phase, roofOpen, roleIndex, set } = useWorld()

  useEffect(() => {
    // No WebGL (or ?lite): fall back to a plain, fully readable page.
    const c = document.createElement("canvas")
    const ok = Boolean(c.getContext("webgl2") ?? c.getContext("webgl")) && !new URLSearchParams(location.search).has("lite")
    if (!ok) {
      set({ webgl: false, ready: true })
      return
    }
    gsap.registerPlugin(ScrollTrigger)
    const tl = buildTimeline(track.current!)
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [set])

  const dark = DARK.has(active) && webgl
  const role = experience[roleIndex]

  return (
    <div ref={root} className={webgl ? "" : "bg-paper"}>
      {webgl ? <Scene eventSource={root} /> : null}
      {/* Reading scrim on the text side, and the veil that hides world jumps */}
      {webgl ? (
        <>
          <div className={`pointer-events-none fixed inset-0 z-10 transition-colors duration-700 ${dark ? "scrim-dark" : "scrim-light"} ${active < 0 ? "opacity-0" : "opacity-100"}`} />
          <div id="veil" className="pointer-events-none fixed inset-0 z-30 bg-paper opacity-0" />
          <div className={`fixed inset-0 z-50 grid place-items-center bg-deep text-paper transition-opacity duration-1000 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}>
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-sage/30 border-t-sage" />
              <p className="font-display text-sm tracking-wide">Building the world</p>
            </div>
          </div>
        </>
      ) : null}

      <header data-ui className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-10">
        <button type="button" onClick={() => goTo(0, 0)} className={`font-display text-base font-semibold tracking-tight ${dark ? "text-paper" : "text-charcoal"}`}>
          Anjana Rodrigo
        </button>
        <button type="button" onClick={() => goTo(7, 0.5)} className={solid + " h-9 px-4 text-xs"}>
          Let&apos;s talk
        </button>
      </header>

      {webgl ? (
        <nav data-ui aria-label="Worlds" className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2.5 md:flex">
          {sections.map((s, i) => (
            <button key={s.id} type="button" onClick={() => goTo(i)} aria-current={active === i ? "step" : undefined} className={`group flex items-center gap-2 text-[11px] font-medium ${dark ? "text-paper" : "text-charcoal"}`}>
              <span className={`transition-opacity ${active === i ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>{s.nav}</span>
              <span className={`h-2 rounded-full transition-all ${active === i ? "w-6 bg-forest" : "w-2 bg-current opacity-30"} ${dark && active === i ? "!bg-sage" : ""}`} />
            </button>
          ))}
        </nav>
      ) : null}

      <main ref={track}>
        <Block index={0} wide>
          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">Hi, I&apos;m {profile.name}.</h1>
          <p className="mt-4 font-display text-xl font-medium text-forest sm:text-2xl">{profile.tagline}</p>
          <p className="mt-3 text-sm font-medium opacity-75">{profile.roles}</p>
          <Lead>{profile.intro}</Lead>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className={solid} onClick={() => goTo(1)}>
              Explore My World <ArrowDown className="h-4 w-4" />
            </button>
            <button type="button" className={ghost} onClick={() => goTo(2)}>
              View Projects
            </button>
          </div>
        </Block>

        <Block index={1}>
          <Kicker>World one | Founder</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">MineBook</h2>
          <Lead>{minebook.line}</Lead>
          <Meta items={minebook.manages} />
          {webgl ? <Hint>Select the haul truck, the site office or the staked bench.</Hint> : null}
          <div className="mt-6">
            <a className={solid} href={minebook.url} target="_blank" rel="noreferrer">
              minebook.lk <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Block>

        <Block index={2}>
          <Kicker>World two</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Software Engineering</h2>
          <Lead>Mobile, web and data platforms, built for people doing real operational work.</Lead>
          <Meta items={softwareStack} />
          {webgl ? <Hint>Select a screen to see the project.</Hint> : null}
        </Block>

        <Block index={3}>
          <Kicker>World three | Construction</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Crack Survey Application</h2>
          <Lead>{crackSurvey.line}</Lead>
          <Meta items={crackSurvey.supports} />
          {webgl ? (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full border border-forest/20 bg-white/50 p-1 backdrop-blur">
                  {(["before", "after"] as const).map((p) => (
                    <button key={p} type="button" aria-pressed={phase === p} onClick={() => set({ phase: p })} className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${phase === p ? "bg-forest text-paper" : "text-charcoal/70"}`}>
                      {p} construction
                    </button>
                  ))}
                </div>
                <button type="button" aria-pressed={roofOpen} onClick={() => set({ roofOpen: !roofOpen })} className={ghost + " h-9 px-4 text-xs"}>
                  {roofOpen ? "Close roof" : "Look inside"}
                </button>
              </div>
              <Hint>Select a crack marker to open its survey record.</Hint>
            </>
          ) : null}
        </Block>

        <Block index={4}>
          <Kicker>World four</Kicker>
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
            <div className="mt-4 flex gap-1.5">
              {experience.map((r, i) => (
                <span key={r.id} className={`h-1.5 rounded-full transition-all ${i === roleIndex ? "w-8 bg-forest" : "w-3 bg-forest/25"}`} />
              ))}
            </div>
          ) : null}
        </Block>

        <Block index={5} wide>
          <Kicker>World five | Published research</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Research and Innovation</h2>
          <p className="mt-5 font-display text-lg font-medium leading-snug">{research.title}</p>
          <Meta items={[research.venue, research.detail]} />
          <Lead>{research.line}</Lead>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className={`${pill} bg-sage text-deep hover:bg-paper`} href={research.url} target="_blank" rel="noreferrer">
              Read on IEEE Xplore <ArrowUpRight className="h-4 w-4" />
            </a>
            {webgl ? (
              <button type="button" className={`${pill} border border-paper/30 hover:bg-paper/10`} onClick={() => set({ panel: { kind: "paper" } })}>
                Authors and details
              </button>
            ) : null}
          </div>
        </Block>

        <Block index={6}>
          <Kicker>About</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">An engineer who builds.</h2>
          <Lead>{about.line}</Lead>
          <ul className="mt-5 space-y-1.5 text-xs opacity-75">
            {about.credentials.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Block>

        <Block index={7}>
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
        <p className={`pointer-events-none fixed bottom-5 left-1/2 z-20 -translate-x-1/2 text-[11px] font-medium tracking-wide transition-opacity md:hidden ${dark ? "text-paper" : "text-charcoal"} ${active < 0 ? "opacity-0" : "opacity-60"}`}>
          {String(Math.max(0, active) + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")} | {sections[Math.max(0, active)].nav}
        </p>
      ) : null}
      <Panels />
    </div>
  )
}
