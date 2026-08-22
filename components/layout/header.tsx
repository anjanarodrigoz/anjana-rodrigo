"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Menu } from "lucide-react"

import { navLinks } from "@/lib/data/portfolio"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const SECTION_IDS = ["home", "work", "about", "experience", "contact"]

export function Header() {
  const [activeSection, setActiveSection] = useState<string>("home")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "-96px 0px -55% 0px" }
    )

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-border/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="#home"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white"
          aria-label="Anjana Rodrigo, back to top"
        >
          AR
        </Link>

        <nav aria-label="Primary navigation" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((item) => {
              const sectionId = item.href.replace("#", "")
              const isActive = activeSection === sectionId
              return (
                <li key={item.name} className="relative">
                  <a
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-navy-muted"
                    )}
                  >
                    {item.name}
                  </a>
                  {isActive && (
                    <span
                      className="absolute -bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#contact">
              Let&apos;s Talk
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-lg text-navy md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Navigate</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-8">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <li key={item.name}>
                      <SheetClose asChild>
                        <a
                          href={item.href}
                          className="block rounded-lg px-3 py-3 text-base font-medium text-navy hover:bg-primary-soft hover:text-primary"
                        >
                          {item.name}
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-8">
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <a href="#contact">
                      Let&apos;s Talk
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
