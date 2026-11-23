import { useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  DEFAULT_GEM,
  GEMS,
  STONE_SHAPES,
  STONE_TYPES,
  defaultSize,
  emptyStoneFilters,
  filterStones,
  largestSize,
  nearest,
  rowAt,
  shapesFor,
  sizeRows,
  sizeScale,
  snapBudget,
  snapSize,
  stockFor,
  STONES,
  type SizeRow,
  type StoneFilters,
  type StoneScope,
  type StoneTypeId,
} from "@/data/stones"
import { FLOW_STONE_QUERY_KEY, useFlow } from "@/flow/flow-context"
import { STONE_PREFERENCE_VARIANTS, type ShopBy, type StonePreferenceVariant } from "@/pages/test-2/variants"
import { useRingBuild } from "@/state/ring-build"

/*
 * Full DYO flow · stone step simulator. A copy of Test 2's src/pages/test-2/preferences.ts (re-synced with
 * Lewis's real-stock version), so Test 2 stays untouched. Only differences:
 *  - prices are worked out against the flow's setting (Ella Cathedral in the chosen metal), not Test 2's,
 *    through setting-price aware copies of three data/stones.ts helpers (below);
 *  - URLs live under /flow (stone, stone/recommendations, diamonds) and the variant is the flow's t2;
 *  - the last preferences are remembered for the stepper's and summary's "Edit" on the stone.
 * Keep it in sync with Test 2.
 */

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

// ── Setting-price aware copies of data/stones.ts helpers (those assume Test 2's setting) ──

let allDiamonds: typeof STONES | undefined

/** data/stones.ts ringPriceBounds, priced with the flow's setting. */
function ringPriceBounds(scope: StoneScope, settingPrice: number) {
  const stock = scope.type === "gemstone" ? stockFor(scope) : (allDiamonds ??= STONES.filter((s) => s.type !== "gemstone"))
  let min = Infinity
  let max = 0
  for (const s of stock) {
    min = Math.min(min, s.price)
    max = Math.max(max, s.price)
  }
  if (!Number.isFinite(min)) return { lo: settingPrice, hi: settingPrice }
  return { lo: settingPrice + min, hi: settingPrice + max }
}

/** data/stones.ts budgetScale, priced with the flow's setting. */
function budgetScale(scope: StoneScope, settingPrice: number) {
  const { lo, hi } = ringPriceBounds(scope, settingPrice)
  const values = [lo]
  for (let v = 800; v < 10000; v += 100) if (v > lo + 40 && v < hi - 40) values.push(v)
  for (let v = 10000; v < 30000; v += 500) if (v > lo + 40 && v < hi - 40) values.push(v)
  for (let v = 30000; v <= 150000; v += 1000) if (v > lo + 40 && v < hi - 40) values.push(v)
  if (hi > lo) values.push(hi)
  return values
}

/** data/stones.ts sizesInBudget, priced with the flow's setting. */
function sizesInBudget(rows: SizeRow[], ringLo: number, ringHi: number, settingPrice: number) {
  return rows.filter((r) => r.count > 0 && settingPrice + r.max >= ringLo && settingPrice + r.min <= ringHi).map((r) => r.size)
}

/**
 * Everything the 2a simulator shows for one set of preferences, read from stock:
 *  - Size first: the size's window gives the stone and ring price range (green band on the budget line).
 *  - Budget first / Size + Budget: the budget (snapped to the stepped scale) gives the sizes in stock at that
 *    budget (green band on the size line). Budget first holds the size handle inside the band; Size + Budget
 *    lets it go outside (the test: should shoppers be able to choose a stone outside their budget?), and then
 *    the prices, matching stones and picks follow the size alone.
 */
export function simulate(shopBy: ShopBy, p: StonePrefs, settingPrice: number) {
  const scope = scopeOf(p)
  const sizes = sizeScale(p.type, p.gem)
  const rows = sizeRows(scope)
  const largest = largestSize(scope)
  const scale = budgetScale(scope, settingPrice)
  const [budgetLo, budgetHi] = snapBudget(scale, p.budgetLo, p.budgetHi)
  const usesBudget = shopBy !== "size"
  const wanted = chosenSize(p)

  const budgetSizes = usesBudget ? sizesInBudget(rows, budgetLo, budgetHi, settingPrice) : []
  const available = !usesBudget || budgetSizes.length > 0
  // The size the preview shows: the chosen size, kept inside the green band in Budget first only.
  const size = shopBy === "budget" && budgetSizes.length ? nearest(budgetSizes, wanted) : Math.min(wanted, Math.max(largest, sizes.min))
  // Size + Budget: is the chosen size one the budget reaches (inside the green band)?
  const inBudget = !usesBudget || budgetSizes.some((s) => Math.abs(s - size) < 1e-6)
  // How the matching stones and picks are found: Size + Budget outside the budget falls back to the size alone.
  const pickMode: ShopBy = shopBy === "both" && !inBudget ? "size" : shopBy
  const row = rowAt(rows, size)
  const sizeRing = row ? { lo: settingPrice + row.min, hi: settingPrice + row.max } : null
  // Size + Budget: this size's prices inside the budget.
  const overlap = sizeRing && shopBy === "both" ? { lo: Math.max(sizeRing.lo, budgetLo), hi: Math.min(sizeRing.hi, budgetHi) } : null
  const fits = !overlap || overlap.hi >= overlap.lo
  // Nothing to show: none in the budget (budget first) or no stones at this size.
  const blocked = shopBy === "budget" ? !available : !row

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
    inBudget,
    pickMode,
    blocked,
    stoneMin: Math.max(0, budgetLo - settingPrice),
    stoneMax: Math.max(0, budgetHi - settingPrice),
  }
}

export type StoneSim = ReturnType<typeof simulate>

/**
 * The stones that match the preferences: what "View All (N)" counts and what the PLP opens with.
 * Size first: the size's window. Budget first: the stone budget. Size + Budget: both (the size alone when
 * the chosen size is outside the budget).
 */
export function prefsFilters(p: StonePrefs, sim: StoneSim): StoneFilters {
  const f: StoneFilters = { ...emptyStoneFilters(p.type), shapes: [sim.scope.shape], gems: p.type === "gemstone" ? [p.gem] : [] }
  const size = { minSize: Math.max(0, sim.size - sim.sizes.window), maxSize: sim.size + sim.sizes.window }
  const budget = { minPrice: sim.stoneMin, maxPrice: sim.stoneMax }
  if (sim.pickMode === "size") return { ...f, ...size }
  if (sim.pickMode === "budget") return { ...f, ...budget }
  return { ...f, ...size, ...budget }
}

export type FlowStoneStep = "preferences" | "recommendations" | "diamonds"

/** /flow/stone (2a), /flow/stone/recommendations (2b) and /flow/diamonds (the PLP), carrying the preferences. */
export function flowStonePath(step: FlowStoneStep, query = "") {
  const path = step === "preferences" ? "/flow/stone" : step === "recommendations" ? "/flow/stone/recommendations" : "/flow/diamonds"
  return `${path}${query}`
}

/** Entry into the stone step from the Settings PDP: natural diamonds in the shape the shopper came in with. */
export function firstStoneQuery(variant: StonePreferenceVariant["id"], shape: string | null | undefined) {
  const s = shape && STONE_SHAPES.some((x) => x.id === shape) ? shape : DEFAULT_PREFS.shape
  return prefsQuery(variant, { ...DEFAULT_PREFS, shape: s })
}

/** Test 2's useStonePrefs for the flow: t2 from the flow config, priced with the build's setting, flow URLs. */
export function useFlowStonePrefs() {
  const flow = useFlow()
  const { setting } = useRingBuild()
  const variantId = flow?.config.t2 ?? "B"
  const variant = STONE_PREFERENCE_VARIANTS[variantId]
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const prefs = useMemo(() => parse(params), [params])
  const sim = useMemo(() => simulate(variant.shopBy, prefs, setting.price), [variant.shopBy, prefs, setting.price])
  const filters = useMemo(() => prefsFilters(prefs, sim), [prefs, sim])
  const matching = useMemo(() => (sim.blocked ? [] : filterStones(filters)), [filters, sim.blocked])

  // Remembered for the stepper's and summary's "Edit" on the stone, which return to these preferences.
  const query = prefsQuery(variantId, prefs)
  useEffect(() => {
    try {
      sessionStorage.setItem(FLOW_STONE_QUERY_KEY, query)
    } catch {
      /* storage unavailable: Edit starts from the stone's shape */
    }
  }, [query])

  /** Update preferences in place (replace, so dragging a slider doesn't flood history). */
  const update = (patch: Partial<StonePrefs>) => {
    const next = { ...prefs, ...patch }
    navigate(flowStonePath("preferences", prefsQuery(variantId, next)), { replace: true, preventScrollReset: true })
  }

  /** Set the size on the current scale (carats for diamonds, millimetres for gemstones). */
  const setSize = (v: number) => update(prefs.type === "gemstone" ? { mm: v } : { carat: v })

  /** Link to a flow stone step, carrying the current preferences. */
  const href = (step: FlowStoneStep, extra?: Record<string, string>) => flowStonePath(step, prefsQuery(variantId, prefs, extra))

  return { variant, prefs, sim, update, setSize, filters, matching, href, setting }
}
