import { Fragment } from "react"
import { useSiteNavigate } from "@/flow/flow-context"
import { CaretRightIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { cn } from "@/lib/utils"

export type Crumb = string | { label: string; to: string }

/** Breadcrumb trail. Links without a route are inert in the prototypes ("not part of this test"). */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  const notInTest = useNotInTest()
  const siteNavigate = useSiteNavigate()
  return (
    <nav aria-label="Breadcrumb" className={cn("flex min-w-0 items-center gap-2 overflow-hidden p-4", className)}>
      {items.map((crumb, i) => {
        const label = typeof crumb === "string" ? crumb : crumb.label
        const last = i === items.length - 1
        return (
          <Fragment key={label}>
            {i > 0 && <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />}
            {last ? (
              <span aria-current="page" className="min-w-0 truncate type-caption text-foreground">
                {label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (typeof crumb === "string") return notInTest(crumb)
                  siteNavigate(crumb.to)
                }}
                className="shrink-0 cursor-pointer type-caption text-muted-foreground hover:text-foreground"
              >
                {label}
              </button>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
