import Image from "next/image"

import type { Credential } from "@/lib/data/portfolio"
import { Card } from "@/components/ui/card"

export function CredentialCard({ credential }: { credential: Credential }) {
  return (
    <Card className="p-6">
      <Image src={credential.icon} alt="" width={48} height={48} className="h-12 w-12" />
      <h3 className="mt-4 text-[16px] font-bold leading-snug text-navy">{credential.title}</h3>
      <p className="mt-1.5 text-sm text-navy-muted">{credential.subtitle}</p>
      <p className="mt-3 text-sm font-semibold text-primary">{credential.period}</p>
    </Card>
  )
}
