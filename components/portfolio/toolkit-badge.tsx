import Image from "next/image"

import type { ToolkitItem } from "@/lib/data/portfolio"

export function ToolkitBadge({ item }: { item: ToolkitItem }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-navy">
      <Image src={item.icon} alt="" width={20} height={20} className="h-5 w-5" />
      {item.name}
    </span>
  )
}
