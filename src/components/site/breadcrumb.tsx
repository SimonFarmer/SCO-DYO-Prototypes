import { Fragment } from "react"
import { CaretRightIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { cn } from "@/lib/utils"

/** Breadcrumb trail. Every link but the last is inert in the prototypes. */
export function Breadcrumb({ items, className }: { items: string[]; className?: string }) {
  const notInTest = useNotInTest()
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 p-4", className)}>
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={item}>
            {i > 0 && <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />}
            {last ? (
              <span aria-current="page" className="truncate type-caption text-foreground">
                {item}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => notInTest(item)}
                className="shrink-0 cursor-pointer type-caption text-muted-foreground hover:text-foreground"
              >
                {item}
              </button>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
