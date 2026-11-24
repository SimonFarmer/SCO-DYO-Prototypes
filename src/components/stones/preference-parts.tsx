import { useEffect, useRef, useState, type ReactNode } from "react"
import { Menu } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import {
  BUDGET_GAP,
  formatSize,
  GEMS,
  STONE_SHAPES,
  STONE_TYPES,
  gemById,
  scaleIndex,
  scalePct,
  stoneShape,
  type SizeScale,
  type StoneTypeId,
} from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Building blocks of the Stone Preferences form (Test 2 · 2a). Behaviour from the BASIC concept,
 * styling from Figma 7685:417428 ("Find your Stone", Size + Budget).
 */

/** Section title row: "Carat Size ........ Preview Size: 1.50 ct" (Headings/H4 + Caption). */
export function ConfigHeader({ title, aside }: { title: string; aside?: { label: string; value: string } }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-primary">
      <h2 className="type-h4 lining-nums">{title}</h2>
      {aside && (
        <p aria-live="polite" className="text-right text-xs leading-4 font-medium whitespace-nowrap">
          {aside.label}: <span className="font-semibold">{aside.value}</span>
        </p>
      )}
    </div>
  )
}

/** Natural / Lab Grown / Gemstones (Figma "Stone Type Configuration"). */
export function StoneTypeToggle({ value, onChange }: { value: StoneTypeId; onChange: (t: StoneTypeId) => void }) {
  return (
    <section className="flex flex-col gap-6">
      <ConfigHeader title="Select your Stone Type" />
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

/** Swatch size and gap in px (size-11, gap-1.5): used to work out how many shapes fit on one row. */
const SWATCH = 44
const SWATCH_GAP = 6

/** Round swatches in a row; selected gets a 2px ring (Figma "Shape Selector"). */
function Swatch({
  on,
  label,
  onClick,
  disabled,
  children,
}: {
  on: boolean
  label: string
  onClick: () => void
  /** Not offered (e.g. a shape a gemstone doesn't come in): crossed out, as on shaneco.com */
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={disabled ? `${label} (not available)` : label}
      title={disabled ? `${label} isn’t available for this stone` : label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex size-11 items-center justify-center overflow-hidden rounded-full bg-primary-foreground p-1",
        on ? "border-2 border-primary" : "border border-input",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:border-border",
      )}
    >
      {children}
      {disabled && <span aria-hidden className="absolute h-px w-[140%] -rotate-45 bg-primary" />}
    </button>
  )
}

/** Shapes: the first 8 then "+N" (Figma "Shape Configuration", "Preview Shape" aside). */
export function ShapeSelector({
  value,
  onChange,
  offered,
}: {
  value: string
  onChange: (id: string) => void
  /** Shapes this stone comes in; others are crossed out (gemstones) */
  offered?: string[]
}) {
  // One row, truncated to fit: when every shape fits there's no "+N"; otherwise the last slot becomes "+N"
  // and narrower screens show fewer shapes (and a bigger N). "+N" expands to every shape, wrapping.
  const [rowRef, width] = useWidth<HTMLDivElement>()
  const [expanded, setExpanded] = useState(false)
  const fits = width ? Math.max(1, Math.floor((width + SWATCH_GAP) / (SWATCH + SWATCH_GAP))) : STONE_SHAPES.length
  const truncated = !expanded && fits < STONE_SHAPES.length
  let shown = STONE_SHAPES
  if (truncated) {
    shown = STONE_SHAPES.slice(0, Math.max(0, fits - 1))
    // The chosen shape always stays visible: it takes the last visible slot if it would be hidden.
    const chosen = STONE_SHAPES.find((s) => s.id === value)
    if (chosen && !shown.includes(chosen)) shown = [...shown.slice(0, -1), chosen]
  }
  const hidden = STONE_SHAPES.length - shown.length

  return (
    <section className="flex flex-col gap-6">
      <ConfigHeader title="Select your Shape" aside={{ label: "Preview Shape", value: stoneShape(value).label }} />
      <div ref={rowRef} className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Shape">
        {shown.map((s) => (
          <Swatch key={s.id} on={s.id === value} label={s.label} onClick={() => onChange(s.id)} disabled={offered ? !offered.includes(s.id) : false}>
            <img src={s.icon} alt="" className={s.id === value ? "size-7.5" : "size-7"} />
          </Swatch>
        ))}
        {truncated && hidden > 0 && (
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
    </section>
  )
}

/** Gemstone picker: only shown when Gemstones is the stone type (concept). */
export function GemSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <section className="flex flex-col gap-6 animate-in fade-in">
      <ConfigHeader title="Select your Gemstone" aside={{ label: "Preview Gemstone", value: gemById(value).label }} />
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Gemstone">
        {GEMS.map((g) => (
          <Swatch key={g.id} on={g.id === value} label={g.label} onClick={() => onChange(g.id)}>
            <img src={g.icon} alt="" className="size-full rounded-full object-cover" />
          </Swatch>
        ))}
      </div>
    </section>
  )
}

/** Width of an element, kept up to date (for placing and merging price tags). */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

const TAG = "absolute top-0 type-label-xs whitespace-nowrap text-muted-foreground"
/** Rough width of a Label/XS tag, to decide when two would collide. */
const tagWidth = (text: string) => text.length * 7.5

/**
 * Two price tags under a line at x1/x2 (0–100 of the track). Centred under handles, or flush with a
 * band's ends; merged into one "a – b" tag when they would collide (concept).
 */
function PriceTags({
  a,
  b,
  x1,
  x2,
  align,
  extra,
}: {
  a: string
  b: string
  x1: number
  x2: number
  align: "center" | "ends"
  /** A third tag (the over-budget projection): under its own point where it clears the others, else on the end of the last tag */
  extra?: { text: string; x: number; className: string } | null
}) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const px1 = (x1 / 100) * w
  const px2 = (x2 / 100) * w
  const clamp = (x: number, tw: number) => Math.max(0, Math.min(w - tw, x))
  const wa = tagWidth(a)
  const wb = tagWidth(b)
  const left = align === "center" ? clamp(px1 - wa / 2, wa) : clamp(px1, wa)
  const right = align === "center" ? clamp(px2 - wb / 2, wb) : clamp(px2 - wb, wb)
  const merged = left + wa + 12 > right
  const both = `${a} – ${b}`
  const wBoth = tagWidth(both)
  const bothLeft = clamp((px1 + px2) / 2 - wBoth / 2, wBoth)
  const we = extra ? tagWidth(extra.text) : 0
  const extraLeft = extra ? clamp((extra.x / 100) * w - we / 2, we) : 0
  const showExtra = !!extra && extraLeft > (merged ? bothLeft + wBoth : right + wb) + 12
  // No room for it on its own: it rides on the end of the last tag instead, in its own colour.
  const inline = !!extra && !showExtra
  const tail = inline && extra ? <span className={cn("ml-2", extra.className)}>{extra.text}</span> : null
  const tailW = inline ? we + 8 : 0
  return (
    <div ref={ref} className="relative mt-1.5 h-3" aria-hidden>
      {w > 0 &&
        (merged ? (
          <span className={TAG} style={{ left: Math.min(bothLeft, Math.max(0, w - wBoth - tailW)) }}>
            {both}
            {tail}
          </span>
        ) : (
          <>
            <span className={TAG} style={{ left }}>
              {a}
            </span>
            <span className={TAG} style={{ left: Math.min(right, Math.max(0, w - wb - tailW)) }}>
              {b}
              {tail}
            </span>
          </>
        ))}
      {w > 0 && showExtra && extra && (
        <span className={cn(TAG, extra.className)} style={{ left: extraLeft }}>
          {extra.text}
        </span>
      )}
    </div>
  )
}

/** Green span on a line (Figma "Selected budget", success colours): sizes in budget or a size's price range. */
function GreenBand({ from, to }: { from: number; to: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 min-w-0.75 border-x border-success bg-success-foreground transition-[left,width] duration-150"
      style={{ left: `${from}%`, width: `${Math.max(to - from, 0)}%` }}
    />
  )
}

/**
 * Budget line (Figma "Total ring budget Configuration").
 *  - With `onChange` (Budget first, Size + Budget): two handles on the stepped scale, tags under them.
 *  - Without (Carat first): no handles; the green band is the size's whole-ring price range, tagged at its ends.
 */
export function BudgetLine({
  scale,
  lo,
  hi,
  onChange,
  band,
  projection,
}: {
  scale: number[]
  lo: number
  hi: number
  onChange?: (lo: number, hi: number) => void
  /** Ring price range shown in green (a size's lowest → highest quality) */
  band?: { lo: number; hi: number } | null
  /** Size + Budget over budget: the cheapest ring at the chosen size, projected past the top handle */
  projection?: number | null
}) {
  const last = scale.length - 1
  const clampToScale = (v: number) => Math.min(scale[last], Math.max(scale[0], v))
  const bandPct = band ? { from: scalePct(scale, clampToScale(band.lo)), to: scalePct(scale, clampToScale(band.hi)) } : null

  if (!onChange) {
    return (
      <div className="flex flex-col">
        <div className="flex h-6 items-center px-2">
          <div className="relative h-1.5 w-full rounded-full bg-muted">{bandPct && <GreenBand {...bandPct} />}</div>
        </div>
        {band && bandPct && (
          <div className="px-2">
            <PriceTags a={formatPrice(band.lo)} b={formatPrice(band.hi)} x1={bandPct.from} x2={bandPct.to} align="ends" />
          </div>
        )}
      </div>
    )
  }

  const gap = Math.min(BUDGET_GAP, last)
  // Over budget (canvas option C): a pink run from the top handle to where the selection's price lands, a red
  // tick there and its price under it (when it clears the handle's tag). Prices past the scale pin to its end.
  const hiPct = scalePct(scale, hi)
  const projPct = projection ? scalePct(scale, clampToScale(projection)) : null
  return (
    <div className="flex flex-col">
      <Slider
        min={0}
        max={last}
        step={1}
        minStepsBetweenValues={gap}
        value={[scaleIndex(scale, lo), scaleIndex(scale, hi)]}
        onValueChange={(v) => {
          const [a, b] = v as number[]
          onChange(scale[a], scale[b])
        }}
        aria-label="Total ring budget"
        trackClassName="h-1.5"
        thumbClassName="shadow-md"
      >
        {bandPct && <GreenBand {...bandPct} />}
        {projPct !== null && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 bg-destructive-foreground transition-[width] duration-200"
              style={{ left: `${hiPct}%`, width: `${Math.max(projPct - hiPct, 0)}%` }}
            />
            <span aria-hidden className="pointer-events-none absolute -top-1.25 h-4 w-0.5 -translate-x-1/2 bg-destructive transition-[left] duration-200" style={{ left: `${projPct}%` }} />
          </>
        )}
      </Slider>
      <div className="px-2">
        <PriceTags
          a={formatPrice(lo)}
          b={formatPrice(hi)}
          x1={scalePct(scale, lo)}
          x2={hiPct}
          align="center"
          extra={projection && projPct !== null ? { text: formatPrice(projection), x: projPct, className: "text-tertiary" } : null}
        />
      </div>
    </div>
  )
}

/**
 * Size line (Figma "Carat Size"): one pill handle with a grip. Diamonds run on the concept's fixed
 * 0.25–5.00 ct line; gemstones on their millimetre range for this setting (as shaneco.com's
 * "Preview with Size"). A stone that tops out below the end of the line gets a tick at its largest
 * size and a hatched track beyond it. `band` (budget modes) is the sizes in stock at the budget.
 */
export function SizeLine({
  scale,
  value,
  onChange,
  largest,
  band,
  over,
}: {
  scale: SizeScale
  value: number
  onChange: (v: number) => void
  largest: number
  band?: { from: number; to: number } | null
  /** Size + Budget over budget: sizes past the band (up to the largest in stock) are tinted pink */
  over?: boolean
}) {
  const pct = (v: number) => (scale.max === scale.min ? 0 : ((Math.max(scale.min, Math.min(scale.max, v)) - scale.min) / (scale.max - scale.min)) * 100)
  const capped = largest < scale.max - 1e-9
  const at = pct(largest)
  return (
    <div className="flex flex-col">
      <Slider
        min={scale.min}
        max={scale.max}
        step={scale.step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        aria-label={scale.unit === "ct" ? "Carat size" : "Gemstone size in millimetres"}
        controlClassName="px-5"
        trackClassName="h-1.5"
        indicatorClassName="bg-transparent"
        thumbClassName="flex h-4 w-10 items-center justify-center shadow-md"
        thumbContent={<Menu aria-hidden className="size-3 rotate-90 text-primary" strokeWidth={2} />}
      >
        {capped && (
          <>
            <span
              aria-hidden
              className="absolute inset-y-0 right-0 rounded-r-full bg-[repeating-linear-gradient(135deg,var(--muted)_0_2px,var(--background)_2px_5px)]"
              style={{ left: `${at}%` }}
            />
            <span aria-hidden className="absolute -top-1.25 h-4 w-px -translate-x-1/2 bg-primary" style={{ left: `${at}%` }} />
          </>
        )}
        {over && band && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 bg-destructive-foreground"
            style={{ left: `${pct(band.to)}%`, width: `${Math.max(at - pct(band.to), 0)}%` }}
          />
        )}
        {band && <GreenBand from={pct(band.from)} to={pct(band.to)} />}
      </Slider>
      <div className="relative mx-5 mt-1.5 h-3 type-label-xs normal-case text-muted-foreground" aria-hidden>
        <span className="absolute -left-4">{formatSize(scale.min, scale.unit)}</span>
        <span className={cn("absolute", capped ? "-translate-x-1/2" : "right-0 translate-x-1/2")} style={capped ? { left: `${at}%` } : undefined}>
          {formatSize(largest, scale.unit)}
        </span>
      </div>
    </div>
  )
}
/** "Price Explained" (Figma popover): Setting and Stone rows, divider, Ring Total. */
export function PriceExplained({
  rows,
  total,
}: {
  /**
   * `over`: the price in red with `note` (red) under the row (Size + Budget over budget). Pass `note` as `null`
   * (not left out) on a row that can get one, so it slides open and shut instead of jolting the page.
   */
  rows: { label: string; desc: ReactNode; price: string; over?: boolean; note?: ReactNode }[]
  total: string
}) {
  return (
    <div className="flex flex-col gap-3 bg-bg-input-50 p-4 text-primary" aria-live="polite">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-0.75">
          <p className="type-label-xs">{r.label}</p>
          <div className="flex items-start gap-2 text-xs leading-4">
            <p className="min-w-0 flex-1 tracking-[0.12px]">{r.desc}</p>
            <p className={cn("text-right font-semibold whitespace-nowrap", r.over && "text-tertiary")}>{r.price}</p>
          </div>
          {r.note !== undefined && <SlideNote>{r.note}</SlideNote>}
        </div>
      ))}
      <div className="h-px bg-border-subtle" />
      <div className="flex items-start justify-between gap-2 text-sm leading-5 font-semibold">
        <span>Ring Total:</span>
        <span className="whitespace-nowrap">{total}</span>
      </div>
    </div>
  )
}

/**
 * A note that slides open (height and fade, 200ms) when it gets content and shut when it loses it, keeping
 * its last text while it closes, so what sits below moves smoothly rather than jumping.
 */
function SlideNote({ children }: { children: ReactNode }) {
  const open = children !== null && children !== false && children !== ""
  const [last, setLast] = useState<ReactNode>(children)
  if (open && children !== last) setLast(children)
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <p className="text-xs leading-4 text-tertiary">{open ? children : last}</p>
      </div>
    </div>
  )
}

/** Grey note for empty states (no stones at a size or a budget). */
export function StockNote({ children }: { children: ReactNode }) {
  return <p className="border border-input bg-secondary px-3 py-2.5 text-xs leading-4 text-muted-foreground">{children}</p>
}
