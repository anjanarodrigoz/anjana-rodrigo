import { useEffect, useRef, useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"

import { contact, nav } from "@/content"
import { useActiveSection, useBodyLock, useScrolled } from "@/hooks"
import { cn } from "@/lib/utils"

const sectionIds = ["home", ...nav.map((item) => item.href.slice(1))]

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={cn("brand", compact && "brand-compact")} href="#home">
      <img src="/assets/brand/ar-logo.png" alt="" width="44" height="44" />
      <span className="brand-text">
        <strong>Anjana Rodrigo</strong>
        <small>Mining Engineering &amp; Applications Development</small>
      </span>
    </a>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled(20)
  const active = useActiveSection(sectionIds)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useBodyLock(open)

  // While open: close on Escape, move focus into the panel, and keep Tab from
  // wandering into the page behind the scrim.
  useEffect(() => {
    if (!open) return

    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [])

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        return
      }

      if (event.key !== "Tab") return

      const items = focusables()
      if (!items.length) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    // Focus immediately, then retry on the next frame: the panel animates in
    // from `visibility: hidden`, and a hidden element silently refuses focus.
    const moveFocus = () => {
      const target = focusables()[0]
      if (target && !panelRef.current?.contains(document.activeElement)) target.focus()
    }

    moveFocus()
    const frame = requestAnimationFrame(moveFocus)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      cancelAnimationFrame(frame)
      // Hand focus back to the trigger on every close path.
      if (panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus()
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to content
      </a>

      <header className={cn("site-header", scrolled && "is-scrolled")}>
        <div className="nav-shell">
          <Brand />

          <nav className="desktop-nav" aria-label="Primary">
            {nav.map((item) => {
              const isActive = active === item.href.slice(1)
              return (
                <a
                  className={cn("nav-link", isActive && "is-active")}
                  href={item.href}
                  key={item.href}
                  aria-current={isActive ? "true" : undefined}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div className="nav-end">
            <a className="btn btn-primary btn-sm header-cta" href="#contact">
              Let&apos;s talk
              <ArrowRight aria-hidden="true" />
            </a>
            <button
              className="nav-toggle"
              type="button"
              ref={triggerRef}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              <Menu aria-hidden="true" />
              <span className="sr-only">Open navigation</span>
            </button>
          </div>
        </div>
      </header>

      <div className={cn("drawer-scrim", open && "is-open")} onClick={close} aria-hidden="true" />

      <div
        className={cn("drawer", open && "is-open")}
        id="mobile-nav"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="drawer-top">
          <Brand compact />
          <button className="nav-toggle" type="button" onClick={close}>
            <X aria-hidden="true" />
            <span className="sr-only">Close navigation</span>
          </button>
        </div>

        <nav className="drawer-nav" aria-label="Primary">
          {nav.map((item, index) => (
            <a href={item.href} key={item.href} onClick={close}>
              <span className="mono-index">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-primary drawer-cta" href={`mailto:${contact.email}`} onClick={close}>
          Start a conversation
          <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </>
  )
}
