/**
 * GLP filter state and logic for the Stone step (Test 3). The sidebar UI lives in
 * components/diamond/diamond-filters.tsx.
 */
import {
  CLARITY_GRADES,
  COLOR_GRADES,
  type CutGrade,
  type Diamond,
  type Shape,
} from "@/data/diamonds"
import { formatPrice } from "@/lib/format"

export type Preset = "brilliant" | "color" | "balance"

export interface DiamondFilterState {
  price: [number, number]
  carat: [number, number]
  shapes: Shape[]
  cuts: CutGrade[]
  /** Index range into COLOR_GRADES (0 = M … 9 = D) */
  color: [number, number]
  /** Index range into CLARITY_GRADES (0 = I3 … 9 = IF) */
  clarity: [number, number]
  preset: Preset | null
}

export const PRICE_BOUNDS: [number, number] = [500, 12000]
export const CARAT_BOUNDS: [number, number] = [0.5, 2.5]

export const NO_FILTERS: DiamondFilterState = {
  price: PRICE_BOUNDS,
  carat: CARAT_BOUNDS,
  shapes: [],
  cuts: [],
  color: [0, COLOR_GRADES.length - 1],
  clarity: [0, CLARITY_GRADES.length - 1],
  preset: null,
}

const idx = <T extends string>(list: readonly T[], v: T) => list.indexOf(v)

/** “What matters most?” presets set Cut, Color and Clarity (Figma 7218:209481). */
export const PRESETS: Record<Preset, { label: string; hint: string; explain: string; set: Pick<DiamondFilterState, "cuts" | "color" | "clarity"> }> = {
  brilliant: {
    label: "Most Brilliant",
    hint: "Maximum sparkle first",
    explain: "We’ve prioritised cut for maximum sparkle: Cut Excellent and above, Color J–G and Clarity SI1–VS1. Adjust any of them below.",
    set: { cuts: ["Shane Classic", "Excellent"], color: [idx(COLOR_GRADES, "J"), idx(COLOR_GRADES, "G")], clarity: [idx(CLARITY_GRADES, "SI1"), idx(CLARITY_GRADES, "VS1")] },
  },
  color: {
    label: "Best Color",
    hint: "Whitest diamonds first",
    explain: "We’ve prioritised whiteness: Color G–D, Cut Very Good and above and Clarity SI1–VS1. Adjust any of them below.",
    set: { cuts: ["Shane Classic", "Excellent", "Very Good"], color: [idx(COLOR_GRADES, "G"), idx(COLOR_GRADES, "D")], clarity: [idx(CLARITY_GRADES, "SI1"), idx(CLARITY_GRADES, "VS1")] },
  },
  balance: {
    label: "Best Balance",
    hint: "Best overall value",
    explain: "We’ve balanced sparkle and price: Cut Very Good and above, Color J–H and Clarity SI2–VS2. Adjust any of them below.",
    set: { cuts: ["Shane Classic", "Excellent", "Very Good"], color: [idx(COLOR_GRADES, "J"), idx(COLOR_GRADES, "H")], clarity: [idx(CLARITY_GRADES, "SI2"), idx(CLARITY_GRADES, "VS2")] },
  },
}


/** Applied-filter chips (“Filter ✕”) derived from the current state. */
export function appliedFilters(f: DiamondFilterState): { label: string; clear: (f: DiamondFilterState) => DiamondFilterState }[] {
  const chips: ReturnType<typeof appliedFilters> = []
  if (f.price[0] !== PRICE_BOUNDS[0] || f.price[1] !== PRICE_BOUNDS[1])
    chips.push({ label: `${formatPrice(f.price[0])}–${formatPrice(f.price[1])}`, clear: (s) => ({ ...s, price: PRICE_BOUNDS }) })
  for (const shape of f.shapes) chips.push({ label: shape, clear: (s) => ({ ...s, shapes: s.shapes.filter((x) => x !== shape) }) })
  if (f.carat[0] !== CARAT_BOUNDS[0] || f.carat[1] !== CARAT_BOUNDS[1])
    chips.push({ label: `${f.carat[0].toFixed(2)}–${f.carat[1].toFixed(2)} ct`, clear: (s) => ({ ...s, carat: CARAT_BOUNDS }) })
  for (const cut of f.cuts) chips.push({ label: cut, clear: (s) => ({ ...s, cuts: s.cuts.filter((x) => x !== cut), preset: null }) })
  if (f.color[0] !== NO_FILTERS.color[0] || f.color[1] !== NO_FILTERS.color[1])
    chips.push({ label: `Color ${COLOR_GRADES[f.color[0]]}–${COLOR_GRADES[f.color[1]]}`, clear: (s) => ({ ...s, color: NO_FILTERS.color, preset: null }) })
  if (f.clarity[0] !== NO_FILTERS.clarity[0] || f.clarity[1] !== NO_FILTERS.clarity[1])
    chips.push({ label: `${CLARITY_GRADES[f.clarity[0]]}–${CLARITY_GRADES[f.clarity[1]]}`, clear: (s) => ({ ...s, clarity: NO_FILTERS.clarity, preset: null }) })
  return chips
}

/** Does a stone pass every active filter? */
export function matchesFilters(d: Diamond, f: DiamondFilterState) {
  const color = COLOR_GRADES.indexOf(d.color)
  const clarity = CLARITY_GRADES.indexOf(d.clarity)
  return (
    d.price >= f.price[0] &&
    d.price <= f.price[1] &&
    d.carat >= f.carat[0] &&
    d.carat <= f.carat[1] &&
    (f.shapes.length === 0 || f.shapes.includes(d.shape)) &&
    (f.cuts.length === 0 || f.cuts.includes(d.cut)) &&
    color >= f.color[0] &&
    color <= f.color[1] &&
    clarity >= f.clarity[0] &&
    clarity <= f.clarity[1]
  )
}
