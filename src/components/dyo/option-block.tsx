import type { ReactNode } from "react"
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react"
import { formatPrice } from "@/lib/format"
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
  emphasis = false,
  invalid = false,
  onClick,
}: {
  label: string
  value?: string
  description?: ReactNode
  media?: ReactNode
  /** Dark border (Figma: ring size block once a size is chosen). */
  emphasis?: boolean
  invalid?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 border bg-primary-foreground text-left transition-colors hover:bg-bg-input-50",
        media ? "p-3" : "p-4",
        invalid ? "border-destructive" : emphasis ? "border-primary" : "border-border-subtle"
      )}
    >
      {media && <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden bg-secondary">{media}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 type-label-xs">
          <span className={value ? "text-muted-foreground" : "text-primary"}>{label}</span>
          {value && <span className="truncate text-primary">{value}</span>}
        </span>
        {description && <span className="type-caption text-muted-foreground">{description}</span>}
      </span>
      <CaretRightIcon className="size-4 shrink-0 text-primary" />
    </button>
  )
}

/**
 * Selected state of an upsell block (Figma "Decorative Crown Block", selected):
 * dark border, label, the chosen item with its price, Edit / Remove, and a green check.
 */
export function AddedOptionBlock({
  label,
  detail,
  price,
  media,
  onEdit,
  onRemove,
}: {
  label: string
  detail: ReactNode
  price: number
  media: ReactNode
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex w-full items-center gap-3 border border-border bg-primary-foreground p-3">
      <span className="flex size-12 shrink-0 items-center justify-center self-start overflow-hidden bg-secondary">{media}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-label-xs text-primary">{label}</span>
        <p className="type-caption text-muted-foreground">
          {detail} · <span className="font-semibold">{formatPrice(price)}</span>
        </p>
        <div className="flex gap-6 pt-1">
          <button type="button" onClick={onEdit} className="cursor-pointer type-label-xs text-primary underline">
            Edit
          </button>
          <button type="button" onClick={onRemove} className="cursor-pointer type-label-xs text-primary underline">
            Remove
          </button>
        </div>
      </div>
      <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-success text-primary-foreground" aria-label="Added">
        <CheckIcon weight="bold" className="size-2" />
      </span>
    </div>
  )
}
