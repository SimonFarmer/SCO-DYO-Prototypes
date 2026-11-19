import { useState, type ReactNode } from "react"
import { CheckIcon } from "@phosphor-icons/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ACCENTS,
  FULFILMENT,
  PLP_METALS,
  SHAPES,
  STORE,
  STYLES,
  type FulfilmentId,
  type ListingFilters,
} from "@/data/plp"
import { cn } from "@/lib/utils"
import { AppliedFilters, PriceRange, type Bounds } from "./filter-parts"
import type { ListKey, ListingMode } from "./use-listing"

export interface FilterPanelProps {
  mode: ListingMode
  filters: ListingFilters
  bounds: Bounds
  onToggle: (key: ListKey, value: string) => void
  onFulfil: (id: FulfilmentId | null) => void
  onPrice: (min: number | null, max: number | null) => void
  /** Replace all filters at once (applied-filter pills and Clear Filter(s)). */
  onChange: (next: ListingFilters) => void
  /** Extra groups placed first (the mobile drawer puts Sort By here). */
  before?: ReactNode
  /** Groups open on first render. The mobile drawer starts with every group collapsed. */
  defaultOpen?: string[]
  className?: string
}

/** Single-choice list (SCO Drop 2 Sort By): radio circles with labels. */
export function RadioList({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: { id: string; label: string }[]
  onChange: (id: string) => void
}) {
  return (
    <RadioGroup value={value ?? ""} onValueChange={(v) => onChange(v as string)} aria-label={label} className="gap-0">
      {options.map((o) => (
        <label key={o.id} className="flex cursor-pointer items-center gap-3 py-2">
          <RadioGroupItem value={o.id} className="border-primary" />
          <span className={cn("text-sm leading-5 text-primary", value === o.id && "font-medium")}>{o.label}</span>
        </label>
      ))}
    </RadioGroup>
  )
}

function Check({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
      )}
    >
      {checked && <CheckIcon className="size-3" weight="bold" />}
    </span>
  )
}

/** Checkbox row (Accent Stones, Setting Price, Fast Delivery). */
export function CheckRow({
  label,
  detail,
  checked,
  onChange,
  role = "checkbox",
}: {
  label: string
  detail?: ReactNode
  checked: boolean
  onChange: () => void
  role?: "checkbox" | "radio"
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full cursor-pointer items-start gap-3 py-2 text-left"
    >
      <span className="pt-0.5">
        <Check checked={checked} />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={cn("text-sm leading-5 text-primary", checked && "font-semibold")}>{label}</span>
        {detail && <span className="type-caption text-muted-foreground">{detail}</span>}
      </span>
    </button>
  )
}

function Group({ value, title, children }: { value: string; title: string; children: ReactNode }) {
  return (
    <AccordionItem value={value} className="border-b border-border-subtle">
      <AccordionTrigger className="items-center font-sans py-5 type-label-s font-semibold text-primary hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-primary">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-6">{children}</AccordionContent>
    </AccordionItem>
  )
}

/**
 * Filter groups (Figma sidebar, 7845:197922 "Frame 427320480"): Setting Style tiles, Metal swatches,
 * Stone Shape icons, then collapsed Accent Stones, Fast Delivery and Pickup, Setting Price.
 * Used by the desktop sidebar (applies instantly) and the mobile drawer (applies on "View N Items").
 */
export function FilterPanel({
  mode,
  filters,
  bounds,
  onToggle,
  onFulfil,
  onPrice,
  onChange,
  before,
  className,
  defaultOpen = ["style", "metal", "shape", "price"],
}: FilterPanelProps) {
  const [moreStyles, setMoreStyles] = useState(false)
  const styles = moreStyles ? STYLES : STYLES.slice(0, 6)
  const ownPrice = mode === "dyo" ? "Setting Price" : "Price"

  return (
    <div className={className}>
      <AppliedFilters filters={filters} bounds={bounds} onChange={onChange} />
      <Accordion multiple defaultValue={defaultOpen}>
      {before}
      <Group value="style" title="Setting Style">
        <ul className="grid grid-cols-2 gap-3">
          {styles.map((s) => {
            const on = filters.style.includes(s.id)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle("style", s.id)}
                  className={cn(
                    "flex w-full cursor-pointer flex-col items-center gap-2 border bg-background px-2 pt-2 pb-4",
                    on ? "border-primary" : "border-border-subtle hover:border-border",
                  )}
                >
                  <img src={s.image} alt="" className="aspect-square w-full object-contain mix-blend-multiply" />
                  <span className={cn("type-label-xs text-primary", on && "underline underline-offset-4")}>{s.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={() => setMoreStyles((m) => !m)}
          className="mt-4 cursor-pointer type-label-xs text-primary underline underline-offset-4"
        >
          {moreStyles ? "Show less" : "Show more"}
        </button>
      </Group>

      <Group value="metal" title="Metal">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-4">
          {PLP_METALS.map((m) => {
            const on = filters.metal.includes(m.id)
            return (
              <li key={m.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle("metal", m.id)}
                  className="flex w-full cursor-pointer items-center gap-2 text-left"
                >
                  <span className={cn("shrink-0 rounded-full border p-0.5", on ? "border-primary" : "border-border-subtle")}>
                    {/* Swatch fill is product data (metal colour), not a design token. */}
                    <span className="block size-6 rounded-full" style={{ background: m.swatch }} />
                  </span>
                  <span className={cn("text-xs-2 leading-4 text-primary", on && "font-semibold")}>{m.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Group>

      <Group value="shape" title={mode === "dyo" ? "Stone Shape" : "Center Stone Shape"}>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-3">
          {SHAPES.map((s) => {
            const on = filters.shape.includes(s.id)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle("shape", s.id)}
                  className="flex w-full cursor-pointer items-center gap-3 text-left"
                >
                  <span className={cn("flex size-8 shrink-0 items-center justify-center border", on ? "border-primary" : "border-transparent")}>
                    <img src={s.icon} alt="" className="size-7" />
                  </span>
                  <span className={cn("text-sm leading-5 text-primary", on && "font-semibold")}>{s.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Group>

      <Group value="accent" title="Accent Stones">
        {ACCENTS.map((a) => (
          <CheckRow key={a.id} label={a.label} checked={filters.accent.includes(a.id)} onChange={() => onToggle("accent", a.id)} />
        ))}
      </Group>

      <Group value="fulfil" title="Fast Delivery and Pickup">
        {mode === "dyo" && <p className="pb-2 type-caption text-muted-foreground">Applies to the setting. Your stone is chosen in the next step.</p>}
        {FULFILMENT.map((f) => (
          <CheckRow
            key={f.id}
            role="radio"
            label={mode === "dyo" ? `Setting ${f.label.toLowerCase()}` : f.label}
            detail={`at ${STORE.name}`}
            checked={filters.fulfil === f.id}
            onChange={() => onFulfil(filters.fulfil === f.id ? null : f.id)}
          />
        ))}
      </Group>

      <Group value="price" title={ownPrice}>
        <PriceRange bounds={bounds} min={filters.minPrice} max={filters.maxPrice} onChange={onPrice} />
      </Group>
      </Accordion>
    </div>
  )
}
