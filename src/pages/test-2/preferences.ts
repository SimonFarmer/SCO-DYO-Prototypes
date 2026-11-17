import { useMemo } from "react"
import { useSearchParams } from "react-router"
import { SETTING } from "@/data/dyo"
import {
  CARAT,
  OVER_BUDGET,
  SIZE_TOLERANCE,
  SIZE_WINDOW,
  STONE_SHAPES,
  STONE_TYPES,
  caratRangeForBudget,
  emptyStoneFilters,
  filterStones,
  stoneType,
  type StoneFilters,
  type StoneTypeId,
} from "@/data/stones"
import { useVariant } from "@/lib/hooks"
import { STONE_PREFERENCE_VARIANTS, VARIANT_IDS, type StonePreferenceVariant } from "./variants"

/**
 * The shopper's stone preferences live in the URL (?variant=A&type=natural&shape=round&carat=1…),
 * so 2a → 2b → PLP and back always keep them, and every state is linkable for the researcher.
 */
export interface StonePrefs {
  type: StoneTypeId
  shape: string
  /** Chosen size (C: the size within the budget; A: the middle of the range, used for the preview) */
  carat: number
  /** Variant A: the carat range the shopper sets with two independent handles */
  caratLo: number
  caratHi: number
  /** Total ring budget. B uses only `hi` ("Up to"); C uses both handles. */
  budgetLo: number
  budgetHi: number
}

export const DEFAULT_PREFS: StonePrefs = {
  type: "natural",
  shape: "round",
  carat: 1,
  caratLo: 1 - SIZE_WINDOW,
  caratHi: 1 + SIZE_WINDOW,
  budgetLo: 5000,
  budgetHi: 7000,
}
/** Figma C starts at $5,000 – $9,000; B at "Up to $7,000". */
const DEFAULT_C_BUDGET = { lo: 5000, hi: 9000 }

/** Snap to the nearest 0.05 ct, inside the stocked range. */
export const snapCarat = (c: number, min: number = CARAT.min, max: number = CARAT.max) =>
  Math.min(max, Math.max(min, Math.round(c * 20) / 20))

/** Middle of A's range, to 2 dp (the size the ring preview shows). */
export const rangeMiddle = (lo: number, hi: number) => Math.round(((lo + hi) / 2) * 100) / 100

function parse(params: URLSearchParams, variant: StonePreferenceVariant["id"]): StonePrefs {
  const typeParam = params.get("type")
  const type = STONE_TYPES.some((t) => t.id === typeParam) ? (typeParam as StoneTypeId) : DEFAULT_PREFS.type
  const shapeParam = params.get("shape")
  const shape = STONE_SHAPES.some((s) => s.id === shapeParam) ? shapeParam! : DEFAULT_PREFS.shape
  // A stores a range ("carat=0.75-1.25"); C a single size ("carat=1.00"). A single value in A opens ±0.25 around it.
  const [c1, c2] = (params.get("carat") ?? "").split("-").map(Number)
  const carat = Number.isFinite(c1) && c1 > 0 ? c1 : DEFAULT_PREFS.carat
  const hasRange = Number.isFinite(c2) && c2 > 0
  const caratLo = snapCarat(hasRange ? Math.min(c1, c2) : carat - SIZE_WINDOW)
  const caratHi = Math.max(caratLo + 0.05, snapCarat(hasRange ? Math.max(c1, c2) : carat + SIZE_WINDOW))
  const [a, b] = (params.get("budget") ?? "").split("-").map(Number)
  const { min, max } = stoneType(type).budget
  const clampBudget = (n: number) => Math.min(max, Math.max(min, n))
  const fallback = variant === "C" ? DEFAULT_C_BUDGET : { lo: DEFAULT_PREFS.budgetLo, hi: DEFAULT_PREFS.budgetHi }
  // B stores a single value ("budget=7000"); C stores a range ("budget=5000-9000").
  const hiRaw = variant === "B" ? a : b
  const budgetHi = clampBudget(Number.isFinite(hiRaw) && hiRaw > 0 ? hiRaw : fallback.hi)
  const budgetLo = Math.min(budgetHi, clampBudget(variant === "C" && Number.isFinite(a) && a > 0 ? a : fallback.lo))
  return {
    type,
    shape,
    carat: variant === "A" ? rangeMiddle(caratLo, caratHi) : snapCarat(carat),
    caratLo,
    caratHi,
    budgetLo,
    budgetHi,
  }
}

/** Query string for a set of preferences (only the values this variant uses). */
export function prefsQuery(variant: StonePreferenceVariant["id"], p: StonePrefs, extra?: Record<string, string>) {
  const q = new URLSearchParams({ variant, type: p.type, shape: p.shape })
  if (variant === "A") q.set("carat", `${p.caratLo.toFixed(2)}-${p.caratHi.toFixed(2)}`)
  if (variant === "C") q.set("carat", p.carat.toFixed(2))
  if (variant === "B") q.set("budget", String(p.budgetHi))
  if (variant === "C") q.set("budget", `${p.budgetLo}-${p.budgetHi}`)
  for (const [k, v] of Object.entries(extra ?? {})) q.set(k, v)
  return `?${q.toString()}`
}

/**
 * The stones that match the preferences: what "View All (N)" counts, what the PLP opens with,
 * and the pool the three recommendations are picked from.
 */
export function prefsFilters(variant: StonePreferenceVariant["id"], p: StonePrefs): StoneFilters {
  const f = { ...emptyStoneFilters(p.type), shapes: [p.shape] }
  if (variant === "A") return { ...f, minCarat: p.caratLo, maxCarat: p.caratHi }
  if (variant === "B") {
    // The sizes the budget panel shows (largest at top grades → largest at the lowest grades), so the
    // picks, the count and the PLP match "Carat range based on budget".
    const sizes = caratRangeForBudget(p.type, p.shape, p.budgetHi)
    return {
      ...f,
      maxPrice: Math.max(0, Math.round((p.budgetHi - SETTING.price) * OVER_BUDGET)),
      ...(!sizes.empty && { minCarat: sizes.topQuality ?? CARAT.min, maxCarat: sizes.lowQuality }),
    }
  }
  return {
    ...f,
    minCarat: p.carat - SIZE_TOLERANCE,
    maxCarat: p.carat + SIZE_TOLERANCE,
    minPrice: Math.max(0, p.budgetLo - SETTING.price),
    maxPrice: Math.max(0, Math.round((p.budgetHi - SETTING.price) * OVER_BUDGET)),
  }
}

/** Target size for "Our Pick": the chosen size in C, the middle of the range in A; B has none (largest wins). */
export const targetCarat = (variant: StonePreferenceVariant["id"], p: StonePrefs) => (variant === "B" ? null : p.carat)

export function useStonePrefs() {
  const variantId = useVariant(VARIANT_IDS)
  const variant = STONE_PREFERENCE_VARIANTS[variantId]
  const [params, setParams] = useSearchParams()
  const prefs = useMemo(() => parse(params, variantId), [params, variantId])
  const filters = useMemo(() => prefsFilters(variantId, prefs), [variantId, prefs])
  const matching = useMemo(() => filterStones(filters), [filters])

  /** Update preferences in place (replace, so dragging a slider doesn't flood history). */
  const update = (patch: Partial<StonePrefs>) => {
    const next = { ...prefs, ...patch }
    const { min, max } = stoneType(next.type).budget
    next.budgetHi = Math.min(max, Math.max(min, next.budgetHi))
    next.budgetLo = Math.min(next.budgetHi, Math.max(min, next.budgetLo))
    setParams(new URLSearchParams(prefsQuery(variantId, next).slice(1)), { replace: true, preventScrollReset: true })
  }

  return { variant, prefs, update, filters, matching, query: (extra?: Record<string, string>) => prefsQuery(variantId, prefs, extra) }
}
