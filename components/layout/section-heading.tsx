import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  className?: string
  align?: "left" | "center"
}

export function SectionHeading({ title, className, align = "left" }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <h2 className="text-[28px] font-bold tracking-tight text-navy sm:text-[32px] md:text-[38px]">
        {title}
      </h2>
      <div
        className={cn(
          "mt-3 flex items-center gap-1.5",
          align === "center" && "justify-center"
        )}
      >
        <span className="h-[3px] w-9 rounded-full bg-primary sm:w-10" aria-hidden="true" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      </div>
    </div>
  )
}
