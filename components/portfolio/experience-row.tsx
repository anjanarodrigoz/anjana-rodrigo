import type { Experience } from "@/lib/data/portfolio"

export function ExperienceRow({ item, isLast }: { item: Experience; isLast: boolean }) {
  return (
    <div className="relative flex gap-5 pb-8 pl-2 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-primary-soft" />
        {!isLast && <span className="mt-1 w-px flex-1 border-l border-dashed border-border" />}
      </div>

      <div className="flex-1 rounded-[18px] border border-border bg-surface p-5 shadow-[0_12px_35px_rgba(7,27,70,0.05)] sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-[15px] font-bold text-navy sm:text-base">
            {item.organization}
            <span className="mx-1.5 text-navy-muted">—</span>
            <span className="font-medium text-navy-muted">{item.role}</span>
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-primary sm:mt-0 sm:shrink-0">
          {item.period}
        </p>
      </div>
    </div>
  )
}
