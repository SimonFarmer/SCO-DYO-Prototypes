import { Fragment } from "react"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps {
  items: string[]
  /** Current page label (rendered in foreground colour, not a link) */
  current: string
  className?: string
}

export function Breadcrumbs({ items, current, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("bg-secondary p-4", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 type-caption">
        {items.map((item) => (
          <Fragment key={item}>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-muted-foreground hover:underline">
                {item}
              </a>
            </li>
            <li aria-hidden>
              <img src="/assets/icons/caret-right.svg" alt="" className="size-4" />
            </li>
          </Fragment>
        ))}
        <li aria-current="page" className="text-foreground">
          {current}
        </li>
      </ol>
    </nav>
  )
}
