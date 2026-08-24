import { useEffect, useRef, useState } from "react"

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** True once the page has scrolled past `offset`, used to condense the header. */
export function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [offset])

  return scrolled
}

/** Id of the section currently occupying the reading zone of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) setActive(visible[0].target.id)
      },
      // Bias the observation window to the upper-middle of the viewport so the
      // highlighted link matches what the reader is actually looking at.
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [ids])

  return active
}

/** Adds `is-visible` to the element the first time it scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Content must never depend on the animation succeeding: reduced motion and
    // browsers without IntersectionObserver skip straight to visible.
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    )

    observer.observe(node)

    // Failsafe: if the observer never reports (stalled frames, odd embedding),
    // reveal anyway rather than leaving the section invisible.
    const failsafe = window.setTimeout(() => setVisible(true), 2500)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return { ref, visible }
}

/** Freezes background scroll while an overlay is open, without a layout jump. */
export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const { overflow, paddingRight } = document.body.style
    const gutter = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = "hidden"
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`

    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [locked])
}

/** Plays a short, quiet UI tick when an interactive control is pressed. */
export function useClickSound() {
  useEffect(() => {
    let audioContext: AudioContext | null = null

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return

      const control = event.target.closest(
        "a, button, summary, [role='button'], input[type='button'], input[type='submit']",
      )
      if (!control || control.matches(":disabled, [aria-disabled='true'], [data-no-click-sound]")) return

      audioContext ??= new AudioContext()
      if (audioContext.state === "suspended") void audioContext.resume()

      const now = audioContext.currentTime
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(620, now)
      oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.045)
      gain.gain.setValueAtTime(0.028, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055)

      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.06)
    }

    document.addEventListener("pointerdown", onPointerDown, { passive: true })
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      if (audioContext) void audioContext.close()
    }
  }, [])
}
