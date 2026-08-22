import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { siteConfig } from "@/lib/data/portfolio"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

const FLOATING_ICONS = [
  { icon: "/assets/icons/contact/email.svg", className: "left-[6%] top-[8%]" },
  { icon: "/assets/icons/contact/chat.svg", className: "right-[10%] top-[22%]" },
  { icon: "/assets/icons/contact/analytics.svg", className: "left-[10%] bottom-[10%]" },
]

export function ContactSection() {
  return (
    <section id="contact" className="py-[72px] md:py-[104px]">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] bg-navy">
          {/* Decorative world-map dots */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
            aria-hidden="true"
          >
            <pattern id="contact-dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#contact-dots)" />
          </svg>

          <div className="relative grid grid-cols-1 items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-6 lg:p-16">
            <div>
              <h2 className="text-[30px] font-black uppercase leading-tight tracking-tight text-white sm:text-[36px] md:text-[42px]">
                Let&apos;s Digitalize
                <br />
                the Operation
              </h2>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-navy hover:bg-white/90"
                >
                  <a href={`mailto:${siteConfig.email}`}>
                    Let&apos;s Talk
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-sm lg:mx-0 lg:ml-auto">
              <Image
                src="/assets/avatar/anjana-with-laptop.png"
                alt="Anjana Rodrigo at his laptop"
                fill
                className="object-contain object-bottom"
                loading="lazy"
                sizes="(max-width: 1024px) 80vw, 380px"
              />

              {FLOATING_ICONS.map(({ icon, className }, index) => (
                <div
                  key={index}
                  className={`absolute flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg ${className}`}
                  aria-hidden="true"
                >
                  <Image src={icon} alt="" width={20} height={20} className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
