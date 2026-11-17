import { useState, type ReactNode } from "react"
import { Slider } from "@/components/ui/slider"
import { STONE_SHAPES, STONE_TYPES, stoneShape, type StoneTypeId } from "@/data/stones"
import { cn } from "@/lib/utils"

/**
 * Building blocks of the Stone Preferences form (Test 2 · 2a, Figma 7685:412966 / 414388 / 415174).
 * Shared by the three variants so only the size/budget controls differ.
 */

/** Section title row: "Select your carat size ........ 1.00 ct" (Headings/H4). */
export function ConfigHeader({ title, value }: { title: string; value?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 type-h4 text-primary lining-nums">
      <h2>{title}</h2>
      {value !== undefined && (
        <span aria-live="polite" className="whitespace-nowrap">
          {value}
        </span>
      )}
    </div>
  )
}

/** Natural / Lab Grown / Gemstones (Figma "Stone Type Configuration"). */
export function StoneTypeToggle({ value, onChange }: { value: StoneTypeId; onChange: (t: StoneTypeId) => void }) {
  return (
    <section className="flex flex-col gap-6">
      <ConfigHeader title="Select your stone type" />
      <div className="flex gap-2" role="radiogroup" aria-label="Stone type">
        {STONE_TYPES.map((t) => {
          const on = t.id === value
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(t.id)}
              className={cn(
                "flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center bg-primary-foreground px-2 type-label-xs text-primary",
                on ? "border-2 border-primary" : "border border-input hover:border-border",
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

const VISIBLE_SHAPES = 8

/** Round shape swatches, the first 8 then "+N" (Figma "Shape Configuration"). */
export function ShapeSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const selectedIndex = STONE_SHAPES.findIndex((s) => s.id === value)
  // A shape chosen from the overflow stays visible.
  const [expanded, setExpanded] = useState(selectedIndex >= VISIBLE_SHAPES)
  const shown = expanded ? STONE_SHAPES : STONE_SHAPES.slice(0, VISIBLE_SHAPES)
  const hidden = STONE_SHAPES.length - VISIBLE_SHAPES

  return (
    <section className="flex flex-col gap-6">
      <ConfigHeader title="Select your shape" />
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Shape">
        {shown.map((s) => {
          const on = s.id === value
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={s.label}
              title={s.label}
              onClick={() => onChange(s.id)}
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-full bg-primary-foreground p-1",
                on ? "border-2 border-primary" : "border border-input hover:border-border",
              )}
            >
              <img src={s.icon} alt="" className={on ? "size-7.5" : "size-7"} />
            </button>
          )
        })}
        {!expanded && hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={`Show ${hidden} more shapes`}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-input type-label-xs text-primary hover:border-border"
          >
            +{hidden}
          </button>
        )}
      </div>
      <p className="text-sm leading-none font-semibold text-muted-foreground">{stoneShape(value).label} Cut</p>
    </section>
  )
}

/** Range labels under a slider ("$1,500 ........ $25,000+"). */
export function SliderScale({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex justify-between px-1 type-label-xs normal-case text-muted-foreground" aria-hidden>
      <span>{from}</span>
      <span>{to}</span>
    </div>
  )
}

const pct = (v: number, min: number, max: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100

/**
 * Simulator slider (6px track). `band` paints a highlighted span that isn't the slider's own value,
 * e.g. the sizes available in your budget behind Variant C's single carat handle.
 */
export function SimSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  band,
  scale,
  minStepsBetweenValues,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number[]
  onChange: (v: number[]) => void
  band?: { from: number; to: number } | null
  scale: { from: string; to: string }
  /** Smallest gap between two handles, in steps */
  minStepsBetweenValues?: number
}) {
  const custom = band !== undefined
  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        {custom && (
          <div aria-hidden className="absolute inset-x-2 top-3 h-1.5 -translate-y-1/2 rounded-full bg-muted">
            {band && (
              <div
                className="absolute inset-y-0 rounded-full bg-primary"
                style={{ left: `${pct(band.from, min, max)}%`, width: `${pct(band.to, min, max) - pct(band.from, min, max)}%` }}
              />
            )}
          </div>
        )}
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={(v) => onChange(Array.isArray(v) ? [...v] : [v as number])}
          aria-label={label}
          minStepsBetweenValues={minStepsBetweenValues}
          trackClassName={cn("h-1.5", custom && "bg-transparent")}
          indicatorClassName={cn(custom && "bg-transparent")}
        />
      </div>
      <SliderScale {...scale} />
    </div>
  )
}

/** Small read-only bar: where a range sits on a scale (inside the result panel). */
export function MiniRange({ from, to, min, max, scale }: { from: number; to: number; min: number; max: number; scale: { from: string; to: string } }) {
  const left = pct(from, min, max)
  const right = pct(to, min, max)
  return (
    <div className="flex flex-col gap-1.5" aria-hidden>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 rounded-full bg-primary" style={{ left: `${left}%`, width: `${Math.max(right - left, 1.5)}%` }} />
      </div>
      <div className="flex justify-between text-xs leading-none text-muted-foreground">
        <span>{scale.from}</span>
        <span>{scale.to}</span>
      </div>
    </div>
  )
}

/** Grey result panel (Figma "Result (information)"): eyebrow, big value, bar, rows and a note. */
export function ResultPanel({
  eyebrow,
  value,
  bar,
  rows,
  note,
}: {
  eyebrow: string
  value: ReactNode
  bar?: ReactNode
  rows?: { label: string; value: string }[]
  note?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 bg-bg-input-50 p-4" aria-live="polite">
      <p className="type-label-xs text-muted-foreground">{eyebrow}</p>
      <p className="type-h4 text-primary lining-nums">{value}</p>
      {bar}
      {rows && rows.length > 0 && (
        <>
          <div className="h-px bg-muted" />
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 leading-none text-muted-foreground">
              <span className="text-xs">{r.label}</span>
              <span className="text-sm font-semibold whitespace-nowrap">{r.value}</span>
            </div>
          ))}
        </>
      )}
      {note && <p className="text-xs leading-4 text-muted-foreground">{note}</p>}
    </div>
  )
}
