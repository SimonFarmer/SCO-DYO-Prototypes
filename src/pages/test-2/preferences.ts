import { useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { SETTING } from "@/data/dyo"
import {
  DEFAULT_GEM,
  GEMS,
  STONE_SHAPES,
  STONE_TYPES,
  budgetScale,
  defaultSize,
  emptyStoneFilters,
  filterStones,
  largestSize,
  nearest,
  rowAt,
  shapesFor,
  sizeRows,
  sizeScale,
  sizesInBudget,
  snapBudget,
  snapSize,
  type StoneFilters,
  type StoneScope,
  type StoneTypeId,
} from "@/data/stones"
import { useVariant } from "@/lib/hooks"
import { STONE_PREFERENCE_VARIANTS, VARIANT_IDS, type ShopBy, type StonePreferenceVariant } from "./variants"

/**
 * The shopper's stone preferences live in the URL (/test-2/a?type=natural&shape=round&carat=1.00…),
 * so 2a → 2b → PLP and back always keep them, and every state is linkable for the researcher.
 * One size and one budget are shared by every stone type and shape (concept), so switching type
 * or shape and back restores them; they're only clamped to a type's range for display.
 * Diamonds are sized in carats and gemstones in millimetres (as on shaneco.com), so each keeps its own.
 */
export interface StonePrefs {
  type: StoneTypeId
  /** The shape the shopper picked (kept even when a gemstone doesn't offer it) */
  shape: string
  /** Gemstones only */
  gem: string
  /** Diamond size (carat handle) */
  carat: number
  /** Gemstone size in millimetres (size handle) */
  mm: number
  /** Total ring budget the shopper set (budget handles; B and C) */
  budgetLo: number
  budgetHi: number
}

export const DEFAULT_PREFS: StonePrefs = { type: "natural", shape: "round", gem: DEFAULT_GEM, carat: 1, mm: 6, budgetLo: 3500, budgetHi: 7000 }

function parse(params: URLSearchParams): StonePrefs {
  const typeParam = params.get("type")
  const type = STONE_TYPES.some((t) => t.id === typeParam) ? (typeParam as StoneTypeId) : DEFAULT_PREFS.type
  const shapeParam = params.get("shape")
  const shape = STONE_SHAPES.some((s) => s.id === shapeParam) ? shapeParam! : DEFAULT_PREFS.shape
  const gemParam = params.get("gem")
  const gem = GEMS.some((g) => g.id === gemParam) ? gemParam! : DEFAULT_PREFS.gem
  const c = Number(params.get("carat"))
  const m = Number(params.get("mm"))
  const [a, b] = (params.get("budget") ?? "").split("-").map(Number)
  const ok = (n: number) => Number.isFinite(n) && n > 0
  return {
    type,
    shape,
    gem,
    carat: ok(c) ? c : DEFAULT_PREFS.carat,
    mm: ok(m) ? m : DEFAULT_PREFS.mm,
    budgetLo: ok(a) ? a : DEFAULT_PREFS.budgetLo,
    budgetHi: ok(b) ? Math.max(a, b) : DEFAULT_PREFS.budgetHi,
  }
}

/** Query string for a set of preferences (only the values this variant uses). The variant lives in the path. */
export function prefsQuery(variant: StonePreferenceVariant["id"], p: StonePrefs, extra?: Record<string, string>) {
  const q = new URLSearchParams({ type: p.type, shape: p.shape })
  if (p.type === "gemstone") q.set("gem", p.gem)
  q.set("carat", p.carat.toFixed(2))
  if (p.type === "gemstone") q.set("mm", p.mm.toFixed(1))
  if (variant !== "A") q.set("budget", `${p.budgetLo}-${p.budgetHi}`)
  for (const [k, v] of Object.entries(extra ?? {})) q.set(k, v)
  return `?${q.toString()}`
}

/** The shape actually in play: a gemstone that doesn't offer the chosen shape falls back to its first (Round, mostly). */
export function effectiveShape(p: StonePrefs) {
  const offered = shapesFor(p.type, p.gem)
  return offered.includes(p.shape) ? p.shape : offered.includes("round") ? "round" : offered[0]
}

export const scopeOf = (p: StonePrefs): StoneScope => ({ type: p.type, shape: effectiveShape(p), gem: p.type === "gemstone" ? p.gem : undefined })

/** The chosen size on the scope's scale: carats for diamonds, millimetres (clamped to the gem's range) for gemstones. */
export function chosenSize(p: StonePrefs) {
  const scale = sizeScale(p.type, p.gem)
  return snapSize(p.type === "gemstone" ? p.mm : p.carat, scale) || defaultSize(scale)
}

/**
 * Everything the 2a simulator shows for one set of preferences, read from stock:
 *  - Size first: the size's window gives the stone and ring price range (green band on the budget line).
 *  - Budget first / Size + Budget: the budget (snapped to the stepped scale) gives the sizes in stock at that
 *    budget (green band on the size line); the size handle is held inside them.
 */
export function simulate(shopBy: ShopBy, p: StonePrefs) {
  const scope = scopeOf(p)
  const sizes = sizeScale(p.type, p.gem)
  const rows = sizeRows(scope)
  const largest = largestSize(scope)
  const scale = budgetScale(scope)
  const [budgetLo, budgetHi] = snapBudget(scale, p.budgetLo, p.budgetHi)
  const usesBudget = shopBy !== "size"
  const wanted = chosenSize(p)

  const budgetSizes = usesBudget ? sizesInBudget(rows, budgetLo, budgetHi) : []
  const available = !usesBudget || budgetSizes.length > 0
  // The size the preview shows: the chosen size, kept inside the green band when a budget is set.
  const size = usesBudget && budgetSizes.length ? nearest(budgetSizes, wanted) : Math.min(wanted, Math.max(largest, sizes.min))
  const row = rowAt(rows, size)
  const sizeRing = row ? { lo: SETTING.price + row.min, hi: SETTING.price + row.max } : null
  // Size + Budget: this size's prices inside the budget.
  const overlap = sizeRing && shopBy === "both" ? { lo: Math.max(sizeRing.lo, budgetLo), hi: Math.min(sizeRing.hi, budgetHi) } : null
  const fits = !overlap || overlap.hi >= overlap.lo
  // Nothing to show: no stones at this size (size first) or none in the budget.
  const blocked = usesBudget ? !available : !row

  return {
    scope,
    sizes,
    rows,
    largest,
    scale,
    budgetLo,
    budgetHi,
    budgetSizes,
    available,
    size,
    row,
    sizeRing,
    overlap: overlap && fits ? overlap : null,
    blocked,
    stoneMin: Math.max(0, budgetLo - SETTING.price),
    stoneMax: Math.max(0, budgetHi - SETTING.price),
  }
}

export type StoneSim = ReturnType<typeof simulate>

/**
 * The stones that match the preferences: what "View All (N)" counts and what the PLP opens with.
 * Size first: the size's window. Budget first: the stone budget. Size + Budget: both.
 */
export function prefsFilters(shopBy: ShopBy, p: StonePrefs, sim: StoneSim): StoneFilters {
  const f: StoneFilters = { ...emptyStoneFilters(p.type), shapes: [sim.scope.shape], gems: p.type === "gemstone" ? [p.gem] : [] }
  const size = { minSize: Math.max(0, sim.size - sim.sizes.window), maxSize: sim.size + sim.sizes.window }
  const budget = { minPrice: sim.stoneMin, maxPrice: sim.stoneMax }
  if (shopBy === "size") return { ...f, ...size }
  if (shopBy === "budget") return { ...f, ...budget }
  return { ...f, ...size, ...budget }
}

export type Test2Step = "preferences" | "recommendations" | "diamonds"

/** Per-variant participant URL, matching the other tests (/test-1/a …): /test-2/a, /test-2/a/recommendations, /test-2/a/diamonds. */
export function test2Path(variant: StonePreferenceVariant["id"], step: Test2Step, query = "") {
  const base = `/test-2/${variant.toLowerCase()}`
  return `${step === "preferences" ? base : `${base}/${step}`}${query}`
}

export function useStonePrefs() {
  const variantId = useVariant(VARIANT_IDS)
  const variant = STONE_PREFERENCE_VARIANTS[variantId]
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const prefs = useMemo(() => parse(params), [params])
  const sim = useMemo(() => simulate(variant.shopBy, prefs), [variant.shopBy, prefs])
  const filters = useMemo(() => prefsFilters(variant.shopBy, prefs, sim), [variant.shopBy, prefs, sim])
  const matching = useMemo(() => (sim.blocked ? [] : filterStones(filters)), [filters, sim.blocked])

  /** Update preferences in place (replace, so dragging a slider doesn't flood history). */
  const update = (patch: Partial<StonePrefs>) => {
    const next = { ...prefs, ...patch }
    // Always written to the per-variant path, so an old ?variant= link settles on its participant URL.
    navigate(test2Path(variantId, "preferences", prefsQuery(variantId, next)), { replace: true, preventScrollReset: true })
  }

  /** Set the size on the current scale (carats for diamonds, millimetres for gemstones). */
  const setSize = (v: number) => update(prefs.type === "gemstone" ? { mm: v } : { carat: v })

  /** Link to a Test 2 step for this variant, carrying the current preferences. */
  const href = (step: Test2Step, extra?: Record<string, string>) => test2Path(variantId, step, prefsQuery(variantId, prefs, extra))

  return { variant, prefs, sim, update, setSize, filters, matching, href }
}
