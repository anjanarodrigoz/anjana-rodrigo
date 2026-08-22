import Image from "next/image"

import { navLinks, siteConfig } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
                AR
              </span>
              <span className="text-base font-bold text-navy">{siteConfig.name}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-primary">{siteConfig.positioning}</p>
            <p className="mt-2 max-w-xs text-sm text-navy-muted">{siteConfig.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-navy">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-navy-muted transition-colors hover:text-primary"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-navy">Let&apos;s Connect</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-navy-muted">
              <li className="flex items-center gap-2">
                <Image
                  src="/assets/icons/contact/email.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors hover:text-primary"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Image
                  src="/assets/icons/contact/location.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
                <span>{siteConfig.location}</span>
              </li>
              <li className="flex items-center gap-2">
                <Image
                  src="/assets/icons/contact/linkedin.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  linkedin.com/in/anjana-rodrigo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-navy-muted">
          © {new Date().getFullYear()} Anjana Rodrigo. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}
