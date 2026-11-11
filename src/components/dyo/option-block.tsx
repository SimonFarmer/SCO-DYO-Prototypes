import type { ReactNode } from "react"
import { CaretRightIcon, CheckCircleIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

/**
 * Tappable configuration row (Figma "Engraving Block" / "Decorative Crown Block" / "Ring Size Block").
 * `media` is the 48px thumbnail; omit it for the compact ring-size style.
 */
export function OptionBlock({
  label,
  value,
  description,
  media,
  selected = false,
  emphasis = false,
  onClick,
}: {
  label: string
  value?: string
  description?: ReactNode
  media?: ReactNode
  selected?: boolean
  /** Dark border (Figma ring size block). */
  emphasis?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 border bg-primary-foreground text-left transition-colors hover:bg-bg-input-50",
        media ? "p-3" : "p-4",
        emphasis || selected ? "border-primary" : "border-border-subtle"
      )}
    >
      {media && <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden bg-secondary">{media}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 type-label-xs">
          <span className={value ? "text-muted-foreground" : "text-primary"}>{label}</span>
          {value && <span className="truncate text-primary">{value}</span>}
          {selected && <CheckCircleIcon className="size-4 shrink-0 text-success" weight="fill" aria-label="Added" />}
        </span>
        {description && <span className="type-caption text-muted-foreground">{description}</span>}
      </span>
      <CaretRightIcon className="size-4 shrink-0 text-primary" />
    </button>
  )
}
