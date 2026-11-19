import { CaretDown } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SHAPES } from "@/data/plp"

/**
 * "Preview with" stone shape picker on the gallery hero (fixes sheet #7).
 * Trigger: Figma 7247:101450 "Gemstone Button" — 196×40, white, 1px input border, shape icon + label + caret.
 * Menu: our dropdown menu (as the PLP sort) with a "View with" heading and the setting's shapes,
 * using the PLP shape icons and labels.
 */
export function StonePreviewMenu({
  shapes,
  value,
  onChange,
  mobileDetail,
}: {
  /** Shape ids from SHAPES (plp.ts) */
  shapes: string[]
  value: string
  onChange: (shape: string) => void
  /** Shown after the shape on phones only, e.g. "1.00 ct" — where the separate "Previewing" badge doesn't fit (Test 1 A/B). */
  mobileDetail?: string
}) {
  const options = shapes.map((id) => SHAPES.find((s) => s.id === id)).filter((s) => s !== undefined)
  const current = options.find((s) => s.id === value) ?? options[0]
  return (
    <DropdownMenu>
      {/* Figma: 196px wide — closest width token is w-49. */}
      <DropdownMenuTrigger
        aria-label={`Preview stone shape: ${current.label}${mobileDetail ? `, ${mobileDetail}` : ""}`}
        className="flex h-10 w-auto min-w-49 cursor-pointer lg:w-49 items-center gap-3 border border-border-subtle bg-primary-foreground px-2 type-label-xs text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <img src={current.icon} alt="" className="size-6 object-contain" />
        <span className="flex-1 text-left whitespace-nowrap">
          {current.label}
          {mobileDetail && <span className="lg:hidden"> ∙ {mobileDetail}</span>}
        </span>
        <CaretDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-49">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pt-2 pb-1 type-label-xs text-xxs text-muted-foreground">View with</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={current.id} onValueChange={(v) => onChange(v as string)}>
            {options.map((s) => (
              <DropdownMenuRadioItem key={s.id} value={s.id} closeOnClick className="gap-3 rounded-none px-2 py-2 type-label-xs text-xxs text-primary">
                <img src={s.icon} alt="" className="size-6 object-contain" />
                {s.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
