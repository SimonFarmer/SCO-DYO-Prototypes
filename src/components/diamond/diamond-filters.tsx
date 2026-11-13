import { useState, type ReactNode } from "react"
import { CaretDownIcon, CaretUpIcon, InfoIcon, XIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { CLARITY_GRADES, COLOR_GRADES, CUT_GRADES, SHAPES, shapeIcon, type CutGrade } from "@/data/diamonds"
import {
  CARAT_BOUNDS,
  NO_FILTERS,
  PRESETS,
  PRICE_BOUNDS,
  appliedFilters,
  type DiamondFilterState,
  type Preset,
} from "@/lib/diamond-filters"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

const CUT_HINT: Record<CutGrade, string> = {
  "Shane Classic": "Maximum sparkle and brilliance",
  Excellent: "Magnificent sparkle and light return",
  "Very Good": "Exceptional sparkle at a great value",
  Good: "Balanced sparkle and value",
  Fair: "Some sparkle with visible dark areas",
  Poor: "Limited sparkle and brilliance",
}

/* ───────────────────────── Building blocks ───────────────────────── */

function FilterSection({
  title,
  defaultOpen = true,
  children,
  info,
}: {
  title: string
  defaultOpen?: boolean
  children?: ReactNode
  info?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col gap-3 border-b border-muted pt-3 pb-5 first:pt-0">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex cursor-pointer items-center gap-2 pt-2 pb-0.5 text-left"
        >
          {/* Figma Label S: 13px semibold uppercase */}
          <span className="flex-1 type-label-s font-semibold text-muted-foreground">{title}</span>
          {open ? <CaretUpIcon className="size-4 text-primary" /> : <CaretDownIcon className="size-4 text-primary" />}
        </button>
        {open && info && (
          <div className="flex flex-col items-start gap-1 pb-1">
            <p className="text-xs tracking-[0.12px] text-muted-foreground">{info}</p>
            <Button variant="link" className="h-6 gap-0.5 px-0" onClick={() => notInTest(`${title} education`)}>
              Learn More
              <InfoIcon />
            </Button>
          </div>
        )}
      </div>
      {open && children}
    </div>
  )
}

/** Two read-out fields over a range slider (price and carat). */
function RangeFields({
  value,
  bounds,
  step,
  format,
  parse,
  onChange,
  label,
}: {
  value: [number, number]
  bounds: [number, number]
  step: number
  format: (n: number) => string
  parse: (s: string) => number
  onChange: (v: [number, number]) => void
  label: string
}) {
  const field = (i: 0 | 1) => (
    <input
      key={`${i}-${value[i]}`}
      aria-label={`${label} ${i === 0 ? "minimum" : "maximum"}`}
      defaultValue={format(value[i])}
      onBlur={(e) => {
        const n = parse(e.target.value)
        if (Number.isNaN(n)) return void (e.target.value = format(value[i]))
        const next: [number, number] = [...value]
        next[i] = Math.min(bounds[1], Math.max(bounds[0], n))
        if (next[0] > next[1]) next.reverse()
        onChange(next)
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className="h-12 w-full min-w-0 border border-border bg-bg-input-30 px-3 text-sm text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
  return (
    <div className="flex flex-col gap-4 pb-1">
      <div className="flex gap-6">
        {field(0)}
        {field(1)}
      </div>
      <Slider
        aria-label={label}
        min={bounds[0]}
        max={bounds[1]}
        step={step}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
      />
    </div>
  )
}

/** Grade slider with tick labels (color M→D, clarity I3→IF). */
function GradeSlider({
  grades,
  value,
  onChange,
  label,
}: {
  grades: readonly string[]
  value: [number, number]
  onChange: (v: [number, number]) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Slider
        aria-label={label}
        min={0}
        max={grades.length - 1}
        step={1}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
      />
      <ol className="flex justify-between">
        {grades.map((g, i) => (
          <li
            key={g}
            className={cn(
              "w-0 flex-1 text-center text-xxs leading-3 font-medium tracking-[1px] uppercase first:text-left last:text-right",
              i >= value[0] && i <= value[1] ? "text-primary" : "text-muted-foreground",
            )}
          >
            {g}
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ───────────────────────── Sidebar ───────────────────────── */

/** “Diamond Filters” sidebar (Figma 7218:221364). Every control filters the grid. */
export function DiamondFilters({ value, onChange }: { value: DiamondFilterState; onChange: (f: DiamondFilterState) => void }) {
  const set = (patch: Partial<DiamondFilterState>) => onChange({ ...value, ...patch })
  const chips = appliedFilters(value)
  return (
    <div className="flex flex-col">
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-muted pb-5">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange(chip.clear(value))}
              className="flex h-6 cursor-pointer items-center gap-1.5 rounded-full bg-muted pr-2.5 pl-3 type-label-xs font-semibold text-primary"
            >
              {chip.label}
              <XIcon className="size-4" />
            </button>
          ))}
          <Button variant="link" className="h-6 px-3" onClick={() => onChange(NO_FILTERS)}>
            Clear Filter(s)
          </Button>
        </div>
      )}

      <FilterSection title="Diamond Price">
        <RangeFields
          label="Diamond price"
          value={value.price}
          bounds={PRICE_BOUNDS}
          step={100}
          format={formatPrice}
          parse={(s) => Number(s.replace(/[^\d.]/g, ""))}
          onChange={(price) => set({ price })}
        />
      </FilterSection>

      <FilterSection title="Stone Shape">
        <div className="grid grid-cols-2 gap-3">
          {SHAPES.map((shape) => {
            const on = value.shapes.includes(shape)
            return (
              <button
                key={shape}
                type="button"
                aria-pressed={on}
                onClick={() => set({ shapes: on ? value.shapes.filter((s) => s !== shape) : [...value.shapes, shape] })}
                className="flex cursor-pointer items-center gap-3 text-left"
              >
                <img src={shapeIcon(shape)} alt="" className={cn("size-7", on && "rounded-full ring-1 ring-primary")} />
                <span className={cn("text-sm text-foreground", on && "font-semibold")}>{shape}</span>
              </button>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection
        title="Carat"
        info="Carat measures a diamond’s weight. While larger carat sizes often appear more impressive, a diamond’s cut and proportions also influence how large it looks."
      >
        <RangeFields
          label="Carat"
          value={value.carat}
          bounds={CARAT_BOUNDS}
          step={0.01}
          format={(n) => `${n.toFixed(2)} ct`}
          parse={(s) => Number(s.replace(/[^\d.]/g, ""))}
          onChange={(carat) => set({ carat })}
        />
      </FilterSection>

      <div className="flex flex-col gap-3 border-b border-muted pt-3 pb-5">
        <p className="pt-2 type-label-s font-semibold text-muted-foreground">What matters most?</p>
        <p className="text-xs tracking-[0.12px] text-muted-foreground">Pick a priority and we’ll set Cut, Color and Clarity below for you.</p>
        <div role="radiogroup" aria-label="What matters most?" className="flex flex-col gap-3">
          {(Object.keys(PRESETS) as Preset[]).map((key) => {
            const p = PRESETS[key]
            const on = value.preset === key
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set({ preset: key, ...p.set })}
                className="flex cursor-pointer items-start gap-3 py-1 text-left"
              >
                <span className={cn("mt-px flex size-4 shrink-0 items-center justify-center rounded-full border border-primary bg-bg-input-30")}>
                  {on && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className="flex flex-col gap-1.5 pt-px">
                  <span className="text-sm leading-none font-medium text-foreground">{p.label}</span>
                  <span className="text-xs tracking-[0.12px] text-muted-foreground">{p.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
        {value.preset && <p className="bg-bg-input-50 p-3 text-xs text-muted-foreground">{PRESETS[value.preset].explain}</p>}
      </div>

      <FilterSection title="Cut" info="Cut determines how brilliantly a diamond reflects light, creating its sparkle and fire.">
        <div className="flex flex-col gap-2">
          {[...CUT_GRADES].reverse().map((cut) => {
            const id = `cut-${cut.replace(" ", "-").toLowerCase()}`
            return (
              <label key={cut} htmlFor={id} className="flex cursor-pointer items-start gap-3 py-1">
                <Checkbox
                  id={id}
                  checked={value.cuts.includes(cut)}
                  onCheckedChange={(on) => set({ preset: null, cuts: on ? [...value.cuts, cut] : value.cuts.filter((c) => c !== cut) })}
                />
                <span className="flex flex-col gap-1">
                  <span className="text-sm leading-none font-medium text-foreground">{cut}</span>
                  <span className="text-xs tracking-[0.12px] text-muted-foreground">{CUT_HINT[cut]}</span>
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title="Color" info="Colour Grade helps compare diamonds from D (brightest white) to M (warmest tone).">
        <GradeSlider label="Color" grades={COLOR_GRADES} value={value.color} onChange={(color) => set({ color, preset: null })} />
      </FilterSection>

      <FilterSection title="Clarity" info="Clarity measures visible inclusions on a scale from IF (highest) to I3 (lowest).">
        <GradeSlider label="Clarity" grades={CLARITY_GRADES} value={value.clarity} onChange={(clarity) => set({ clarity, preset: null })} />
      </FilterSection>

      <FilterSection title="Certification" defaultOpen={false}>
        <p className="text-xs text-muted-foreground">All our natural diamonds are GIA certified.</p>
      </FilterSection>
      <FilterSection title="L/W Ratio" defaultOpen={false}>
        <p className="text-xs text-muted-foreground">Length-to-width ratio applies to fancy shapes. Every round diamond is 1.00–1.01.</p>
      </FilterSection>
    </div>
  )
}
