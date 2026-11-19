import { useState, type ReactNode } from "react"
import { CaretDownIcon, InfoIcon, XIcon } from "@phosphor-icons/react"
import { CheckRow } from "@/components/plp/filter-panel"
import { PriceRange } from "@/components/plp/filter-parts"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import {
  formatSize,
  sizeBounds,
  GEMS,
  STONE_SHAPES,
  emptyStoneFilters,
  gradesFor,
  stonePriceBounds,
  gemById,
  stoneShape,
  type StoneFilters,
} from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Diamond PLP filters (Figma "Diamond Filters — Preset: Most Brilliant"): applied pills, Diamond
 * Price, Stone Shape, Carat (millimetres for gemstones), "What matters most?" presets, Cut, Color, Clarity, then the collapsed
 * Certification and L/W Ratio (not part of this test).
 */

export type PresetId = "most-brilliant" | "best-color" | "best-balance"

/** Grade indexes refer to the diamond scales in data/stones (worst first). */
export const PRESETS: { id: PresetId; label: string; detail: string; explain: string; set: Pick<StoneFilters, "cuts" | "color" | "clarity"> }[] = [
  {
    id: "most-brilliant",
    label: "Most Brilliant",
    detail: "Maximum sparkle first",
    explain: "We’ve prioritised cut for maximum sparkle: Cut Excellent and above, Color J–G and Clarity SI1–VS1. Adjust any of them below.",
    set: { cuts: [4, 5], color: [3, 6], clarity: [4, 6] },
  },
  {
    id: "best-color",
    label: "Best Color",
    detail: "Whitest diamonds first",
    explain: "We’ve prioritised color for the whitest diamonds: Color F–D, Clarity SI1–VS1 and Cut Very Good and above. Adjust any of them below.",
    set: { cuts: [3, 4, 5], color: [7, 9], clarity: [4, 6] },
  },
  {
    id: "best-balance",
    label: "Best Balance",
    detail: "Best overall value",
    explain: "We’ve balanced all four Cs for the best overall value: Cut Very Good and above, Color I–G and Clarity SI1–VS2. Adjust any of them below.",
    set: { cuts: [3, 4, 5], color: [4, 6], clarity: [4, 5] },
  },
]


function Group({ value, title, info, children }: { value: string; title: string; info?: string; children: ReactNode }) {
  const notInTest = useNotInTest()
  return (
    <AccordionItem value={value} className="border-b border-muted">
      <AccordionTrigger className="items-center py-4 font-sans type-label-s font-semibold text-muted-foreground hover:no-underline **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-primary">
        {title}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pb-5">
        {info && (
          <div className="flex flex-col items-start gap-1">
            <p className="text-xs leading-4 tracking-[0.12px] text-muted-foreground">{info}</p>
            <button
              type="button"
              onClick={() => notInTest("Diamond education")}
              className="flex h-6 cursor-pointer items-center gap-0.5 type-label-xs text-primary underline"
            >
              Learn More <InfoIcon className="size-4" />
            </button>
          </div>
        )}
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}

/** Two inputs over a two-thumb slider, for carat weight. */
/** Two inputs over a two-thumb slider, for size: carats for diamonds, millimetres for gemstones. */
function SizeRange({
  type,
  min,
  max,
  onChange,
}: {
  type: StoneFilters["type"]
  min: number | null
  max: number | null
  onChange: (lo: number | null, hi: number | null) => void
}) {
  const B = sizeBounds(type)
  const fmt = (v: number) => formatSize(v, B.unit)
  const applied: [number, number] = [min ?? B.min, max ?? B.max]
  const [range, setRange] = useState(applied)
  const [seen, setSeen] = useState(applied.join())
  if (applied.join() !== seen) {
    setSeen(applied.join())
    setRange(applied)
  }
  const commit = ([a, b]: [number, number]) => {
    const lo = Math.max(B.min, Math.min(a, b))
    const hi = Math.min(B.max, Math.max(a, b))
    setRange([lo, hi])
    onChange(lo <= B.min ? null : lo, hi >= B.max ? null : hi)
  }
  const input = (i: 0 | 1, label: string) => (
    <input
      key={`${i}-${range[i]}`}
      inputMode="decimal"
      aria-label={label}
      defaultValue={fmt(range[i])}
      onBlur={(e) => {
        const n = Number(e.currentTarget.value.replace(/[^\d.]/g, ""))
        if (Number.isFinite(n) && n > 0) commit(i === 0 ? [n, range[1]] : [range[0], n])
        else e.currentTarget.value = fmt(range[i])
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="h-12 w-full min-w-0 border border-border bg-background px-3 text-sm text-primary outline-none focus-visible:border-primary"
    />
  )
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        {input(0, "Minimum carat")}
        {input(1, "Maximum carat")}
      </div>
      <Slider
        min={B.min}
        max={B.max}
        step={B.step}
        minStepsBetweenValues={1}
        value={range}
        onValueChange={(v) => setRange(v as [number, number])}
        onValueCommitted={(v) => commit(v as [number, number])}
        aria-label={B.unit === "ct" ? "Carat range" : "Size range in millimetres"}
      />
    </div>
  )
}

/** Grade range slider with a tick label per grade (Color M–D, Clarity I3–IF). */
function GradeRange({
  label,
  grades,
  value,
  onChange,
}: {
  label: string
  grades: string[]
  value: [number, number] | null
  onChange: (v: [number, number] | null) => void
}) {
  const last = grades.length - 1
  const shown = value ?? [0, last]
  return (
    <div className="flex flex-col gap-1">
      <Slider
        min={0}
        max={last}
        step={1}
        value={shown}
        onValueChange={(v) => {
          const [a, b] = v as number[]
          onChange(a === 0 && b === last ? null : [a, b])
        }}
        aria-label={label}
        trackClassName="h-1.5"
      />
      {grades.some((x) => x.length > 4) ? (
        // Long grade names (sapphires) don't fit under every tick: label the ends and the selection.
        <div className="flex justify-between gap-2 text-xxs leading-3 font-medium tracking-[1px] text-primary uppercase" aria-hidden>
          <span>{grades[shown[0]]}</span>
          <span className="text-right">{grades[shown[1]]}</span>
        </div>
      ) : (
        <div className="flex justify-between px-2" aria-hidden>
          {grades.map((x, i) => (
            <span
              key={x}
              className={cn(
                "flex w-0 justify-center text-xxs leading-3 font-medium tracking-[1px] whitespace-nowrap uppercase",
                i >= shown[0] && i <= shown[1] ? "text-primary" : "text-muted-foreground",
              )}
            >
              {x}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Applied filter pills + "Clear Filter(s)" (SCO Drop 2 pattern, as on the setting PLP). */
function AppliedPills({ filters, onChange }: { filters: StoneFilters; onChange: (f: StoneFilters) => void }) {
  const g = gradesFor(filters.type)
  const pills: { key: string; label: string; next: StoneFilters }[] = []
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const b = stonePriceBounds(filters.type)
    pills.push({ key: "price", label: `${formatPrice(filters.minPrice ?? b.min)} - ${formatPrice(filters.maxPrice ?? b.max)}`, next: { ...filters, minPrice: null, maxPrice: null } })
  }
  for (const id of filters.gems) pills.push({ key: `gem-${id}`, label: gemById(id).label, next: { ...filters, gems: filters.gems.filter((g) => g !== id) } })
  for (const id of filters.shapes) pills.push({ key: `shape-${id}`, label: stoneShape(id).label, next: { ...filters, shapes: filters.shapes.filter((s) => s !== id) } })
  if (filters.minSize !== null || filters.maxSize !== null) {
    const B = sizeBounds(filters.type)
    pills.push({ key: "size", label: `${formatSize(filters.minSize ?? B.min, B.unit)} - ${formatSize(filters.maxSize ?? B.max, B.unit)}`, next: { ...filters, minSize: null, maxSize: null } })
  }
  for (const c of filters.cuts) pills.push({ key: `cut-${c}`, label: g.cut[c].label, next: { ...filters, cuts: filters.cuts.filter((x) => x !== c) } })
  if (filters.color) pills.push({ key: "color", label: `Color ${g.color[filters.color[0]].label}–${g.color[filters.color[1]].label}`, next: { ...filters, color: null } })
  if (filters.clarity) pills.push({ key: "clarity", label: `${g.clarity[filters.clarity[0]].label}–${g.clarity[filters.clarity[1]].label}`, next: { ...filters, clarity: null } })
  if (!pills.length) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-muted pb-5">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.next)}
          aria-label={`Remove filter: ${p.label}`}
          className="flex h-6 cursor-pointer items-center gap-1.5 rounded-full bg-muted pr-2.5 pl-3 type-label-xs text-primary hover:bg-accent"
        >
          {p.label}
          <XIcon className="size-4" />
        </button>
      ))}
      <button type="button" onClick={() => onChange(emptyStoneFilters(filters.type))} className="h-6 cursor-pointer px-3 type-label-xs text-primary underline">
        Clear Filter(s)
      </button>
    </div>
  )
}

export function DiamondFilterPanel({
  filters,
  onChange,
  preset,
  onPreset,
  className,
}: {
  filters: StoneFilters
  onChange: (f: StoneFilters) => void
  preset: PresetId | null
  onPreset: (p: PresetId | null) => void
  className?: string
}) {
  const notInTest = useNotInTest()
  const diamond = filters.type !== "gemstone"
  const g = gradesFor(filters.type)
  const bounds = stonePriceBounds(filters.type)
  // Editing a grade by hand means the shopper has moved off the preset.
  const setGrades = (patch: Partial<StoneFilters>) => {
    onPreset(null)
    onChange({ ...filters, ...patch })
  }
  const activePreset = PRESETS.find((p) => p.id === preset)

  return (
    <div className={className}>
      <AppliedPills
        filters={filters}
        onChange={(f) => {
          if (f.cuts !== filters.cuts || f.color !== filters.color || f.clarity !== filters.clarity) onPreset(null)
          onChange(f)
        }}
      />
      <Accordion multiple defaultValue={["gem", "price", "shape", "carat", "cut", "color", "clarity"]}>
        {!diamond && (
          <Group value="gem" title="Gemstone">
            <ul className="grid grid-cols-2 gap-3">
              {GEMS.map((g) => {
                const on = filters.gems.includes(g.id)
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onChange({ ...filters, gems: on ? filters.gems.filter((x) => x !== g.id) : [...filters.gems, g.id] })}
                      className="flex w-full cursor-pointer items-center gap-3 text-left"
                    >
                      <span className={cn("shrink-0 rounded-full border p-0.5", on ? "border-primary" : "border-transparent")}>
                        <img src={g.icon} alt="" className="block size-6 rounded-full object-cover" />
                      </span>
                      <span className={cn("text-sm leading-5 text-foreground", on && "font-semibold")}>{g.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Group>
        )}
        <Group value="price" title={diamond ? "Diamond Price" : "Gemstone Price"}>
          <PriceRange bounds={bounds} min={filters.minPrice} max={filters.maxPrice} onChange={(minPrice, maxPrice) => onChange({ ...filters, minPrice, maxPrice })} />
        </Group>

        <Group value="shape" title="Stone Shape">
          <ul className="grid grid-cols-2 gap-3">
            {STONE_SHAPES.map((s) => {
              const on = filters.shapes.includes(s.id)
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ ...filters, shapes: on ? filters.shapes.filter((x) => x !== s.id) : [...filters.shapes, s.id] })}
                    className="flex w-full cursor-pointer items-center gap-3 text-left"
                  >
                    <span className={cn("flex size-8 shrink-0 items-center justify-center border", on ? "border-primary" : "border-transparent")}>
                      <img src={s.icon} alt="" className="size-7" />
                    </span>
                    <span className={cn("text-sm leading-5 text-foreground", on && "font-semibold")}>{s.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Group>

        <Group
          value="carat"
          title={diamond ? "Carat" : "Size (mm)"}
          info={
            diamond
              ? "Carat measures a diamond’s weight. While larger carat sizes often appear more impressive, a diamond’s cut and proportions also influence how large it looks."
              : "Gemstones are sized by their face-up measurement in millimetres."
          }
        >
          <SizeRange key={filters.type} type={filters.type} min={filters.minSize} max={filters.maxSize} onChange={(minSize, maxSize) => onChange({ ...filters, minSize, maxSize })} />
        </Group>

        {diamond && (
          <div className="flex flex-col gap-3 border-b border-muted py-5">
            <p className="type-label-s text-muted-foreground">What matters most?</p>
            <p className="text-xs leading-4 tracking-[0.12px] text-muted-foreground">Pick a priority and we’ll set Cut, Color and Clarity below for you.</p>
            <RadioGroup
              value={preset ?? ""}
              onValueChange={(v) => {
                const p = PRESETS.find((x) => x.id === v)!
                onPreset(p.id)
                onChange({ ...filters, ...p.set })
              }}
              aria-label="What matters most"
              className="gap-3"
            >
              {PRESETS.map((p) => (
                <label key={p.id} className="flex cursor-pointer items-start gap-3 py-1">
                  <RadioGroupItem value={p.id} className="border-primary" />
                  <span className="flex flex-col gap-1.5 pt-px">
                    <span className="text-sm leading-none font-medium text-foreground">{p.label}</span>
                    <span className="text-xs leading-4 tracking-[0.12px] text-muted-foreground">{p.detail}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
            {activePreset && <p className="bg-bg-input-50 p-3 text-xs leading-4 text-muted-foreground">{activePreset.explain}</p>}
          </div>
        )}

        <Group value="cut" title="Cut" info={diamond ? "Cut determines how brilliantly a diamond reflects light, creating its sparkle and fire." : undefined}>
          <div className="flex flex-col">
            {[...g.cut].map((c, i) => ({ ...c, i })).reverse().map((c) => (
              <CheckRow
                key={c.label}
                label={c.label}
                detail={c.detail}
                checked={filters.cuts.includes(c.i)}
                onChange={() => setGrades({ cuts: filters.cuts.includes(c.i) ? filters.cuts.filter((x) => x !== c.i) : [...filters.cuts, c.i] })}
              />
            ))}
          </div>
        </Group>

        <Group value="color" title="Color" info={diamond ? "Color Grade helps compare diamonds from D (brightest white) to M (warmest tone)." : "From light to deep royal blue."}>
          <GradeRange label="Color" grades={g.color.map((x) => x.label)} value={filters.color} onChange={(color) => setGrades({ color })} />
        </Group>

        <Group value="clarity" title="Clarity" info={diamond ? "Clarity measures visible inclusions on a scale from IF (highest) to I3 (lowest)." : undefined}>
          <GradeRange label="Clarity" grades={g.clarity.map((x) => x.label)} value={filters.clarity} onChange={(clarity) => setGrades({ clarity })} />
        </Group>
      </Accordion>

      {["Certification", "L/W Ratio"].map((title) => (
        <button
          key={title}
          type="button"
          onClick={() => notInTest(`The ${title} filter`)}
          className="flex w-full cursor-pointer items-center justify-between border-b border-muted py-4 type-label-s text-muted-foreground"
        >
          {title}
          <CaretDownIcon className="size-4 text-primary" />
        </button>
      ))}
    </div>
  )
}
