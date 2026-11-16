import { useState } from "react"
import { XIcon } from "@phosphor-icons/react"
import { Slider } from "@/components/ui/slider"
import { ACCENTS, PLP_METALS, SHAPES, STYLES, hasPrice, type ListingFilters } from "@/data/plp"
import { formatPrice } from "@/lib/format"
import type { ListKey } from "./use-listing"

export interface Bounds {
  min: number
  max: number
}

/** "$200 - $9,000" for a price filter, filling open ends with the catalogue bounds. */
export const priceLabel = (f: ListingFilters, b: Bounds) => `${formatPrice(f.minPrice ?? b.min)} - ${formatPrice(f.maxPrice ?? b.max)}`

const LABELS: Record<ListKey, { id: string; label: string }[]> = {
  style: STYLES,
  shape: SHAPES,
  metal: PLP_METALS,
  accent: ACCENTS,
}

/**
 * Applied filters (SCO Drop 2 PLP, 7165:357868): one grey pill per selected value with ✕, then
 * "Clear Filter(s)". Fulfilment isn't repeated here: its chip in the filter bar has its own ✕.
 */
export function AppliedFilters({
  filters,
  bounds,
  onChange,
}: {
  filters: ListingFilters
  bounds: Bounds
  onChange: (next: ListingFilters) => void
}) {
  const pills: { key: string; label: string; remove: () => ListingFilters }[] = []
  if (hasPrice(filters)) pills.push({ key: "price", label: priceLabel(filters, bounds), remove: () => ({ ...filters, minPrice: null, maxPrice: null }) })
  for (const key of ["style", "metal", "shape", "accent"] as ListKey[]) {
    for (const id of filters[key]) {
      const label = LABELS[key].find((o) => o.id === id)?.label ?? id
      pills.push({ key: `${key}-${id}`, label, remove: () => ({ ...filters, [key]: filters[key].filter((v) => v !== id) }) })
    }
  }
  if (!pills.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-5">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.remove())}
          aria-label={`Remove filter: ${p.label}`}
          className="flex h-6 cursor-pointer items-center gap-1.5 rounded-full bg-muted pr-2 pl-3 type-label-xs text-primary hover:bg-accent"
        >
          {p.label}
          <XIcon className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...filters, style: [], shape: [], metal: [], accent: [], minPrice: null, maxPrice: null })}
        className="h-6 cursor-pointer px-3 type-label-xs text-primary hover:underline"
      >
        Clear Filter(s)
      </button>
    </div>
  )
}

/** "$ 1,200" ↔ 1200. */
const toNumber = (text: string) => {
  const n = Number(text.replace(/[^\d.]/g, ""))
  return text.trim() && Number.isFinite(n) ? Math.round(n) : null
}

function PriceInput({ label, value, onCommit }: { label: string; value: number; onCommit: (n: number | null) => void }) {
  const [text, setText] = useState(formatPrice(value))
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setText(formatPrice(value))
  }
  const commit = () => {
    const n = toNumber(text)
    onCommit(n)
    if (n === null) setText(formatPrice(value))
  }
  return (
    <input
      inputMode="numeric"
      aria-label={label}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      className="h-12 w-full min-w-0 border border-border bg-background px-3 text-sm text-primary outline-none focus-visible:border-primary"
    />
  )
}

/**
 * Price filter (SCO Drop 2): min and max inputs over a two-thumb range slider. Dragging updates the
 * inputs live and applies on release; typed values apply on Enter or blur. A bound at the end of the
 * range counts as "no limit", so the filter clears itself when both thumbs are at the ends.
 */
export function PriceRange({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: Bounds
  min: number | null
  max: number | null
  onChange: (min: number | null, max: number | null) => void
}) {
  const applied: [number, number] = [min ?? bounds.min, max ?? bounds.max]
  const [range, setRange] = useState(applied)
  const [seen, setSeen] = useState(applied.join())
  if (applied.join() !== seen) {
    setSeen(applied.join())
    setRange(applied)
  }

  const commit = ([lo, hi]: [number, number]) => {
    const a = Math.max(bounds.min, Math.min(lo, hi))
    const b = Math.min(bounds.max, Math.max(lo, hi))
    setRange([a, b])
    onChange(a <= bounds.min ? null : a, b >= bounds.max ? null : b)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        <PriceInput label="Minimum price" value={range[0]} onCommit={(n) => commit([n ?? bounds.min, range[1]])} />
        <PriceInput label="Maximum price" value={range[1]} onCommit={(n) => commit([range[0], n ?? bounds.max])} />
      </div>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={50}
        minStepsBetweenValues={1}
        value={range}
        onValueChange={(v) => setRange(v as [number, number])}
        onValueCommitted={(v) => commit(v as [number, number])}
        aria-label="Price range"
      />
    </div>
  )
}
