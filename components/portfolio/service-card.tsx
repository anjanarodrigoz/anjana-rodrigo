import Image from "next/image"
import { ArrowRight } from "lucide-react"

import type { Service } from "@/lib/data/portfolio"
import { Card } from "@/components/ui/card"

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="group p-6 transition-all hover:-translate-y-1 hover:border-primary/40 sm:p-7">
      <Image src={service.icon} alt="" width={48} height={48} className="h-12 w-12" />
      <h3 className="mt-5 text-[18px] font-bold text-navy sm:text-[19px]">{service.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-navy-muted sm:text-base">
        {service.description}
      </p>
      <ArrowRight
        className="mt-4 h-4 w-4 text-primary transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Card>
  )
}
