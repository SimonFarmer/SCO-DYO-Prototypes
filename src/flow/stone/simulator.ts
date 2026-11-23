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
  type SizeRow,
  type StoneFilters,
  type StoneScope,
  type StoneTypeId,
} from "@/data/stones"
import { FLOW_STONE_QUERY_KEY, useFlow } from "@/flow/flow-context"
import { STONE_PREFERENCE_VARIANTS, type ShopBy, type StonePreferenceVariant } from "@/pages/test-2/variants"
import { useRingBuild } from "@/state/ring-build"

/**
 * Full DYO flow · stone step simulator. A copy of Test 2's preferences logic (src/pages/test-2/preferences.ts),
 * so Test 2 stays untouched, with two differences:
 *  - prices are worked out against the flow's setting (Ella Cathedral in the chosen metal), not Test 2's;
 *  - URLs live under /flow/stone and the variant comes from the flow config (t2).
 * The stone data, scales and pick rules are the shared ones in data/stones.ts.
 */

export interface StonePrefs {
  type: StoneTypeId
  shape: string
  gem: string
  carat: number
  mm: number
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

export function prefsQuery(variant: StonePreferenceVariant["id"], p: StonePrefs, extra?: Record<string, string>) {
  const q = new URLSearchParams({ type: p.type, shape: p.shape })
  if (p.type === "gemstone") q.set("gem", p.gem)
  q.set("carat", p.carat.toFixed(2))
  if (p.type === "gemstone") q.set("mm", p.mm.toFixed(1))
  if (variant !== "A") q.set("budget", `${p.budgetLo}-${p.budgetHi}`)
  for (const [k, v] of Object.entries(extra ?? {})) q.set(k, v)
  return `?${q.toString()}`
}

export function effectiveShape(p: StonePrefs) {
  const offered = shapesFor(p.type, p.gem)
  return offered.includes(p.shape) ? p.shape : offered.includes("round") ? "round" : offered[0]
}

export const scopeOf = (p: StonePrefs): StoneScope => ({ type: p.type, shape: effectiveShape(p), gem: p.type === "gemstone" ? p.gem : undefined })

export function chosenSize(p: StonePrefs) {
  const scale = sizeScale(p.type, p.gem)
  return snapSize(p.type === "gemstone" ? p.mm : p.carat, scale) || defaultSize(scale)
}

// ── Setting-price aware copies of data/stones.ts helpers (those assume Test 2's setting) ──

function ringPriceBounds(scope: StoneScope, settingPrice: number) {
  let min = Infinity
  let max = 0
  for (const s of stockFor(scope)) {
    min = Math.min(min, s.price)
    max = Math.max(max, s.price)
  }
  if (!Number.isFinite(min)) return { lo: settingPrice, hi: settingPrice }
  return { lo: settingPrice + min, hi: settingPrice + max }
}

/** Same stepped budget scale as data/stones.ts budgetScale, priced with the flow's setting. */
function budgetScale(scope: StoneScope, settingPrice: number) {
  const { lo, hi } = ringPriceBounds(scope, settingPrice)
  const values = [lo]
  for (let v = 800; v < 10000; v += 100) if (v > lo + 40 && v < hi - 40) values.push(v)
  for (let v = 10000; v < 30000; v += 500) if (v > lo + 40 && v < hi - 40) values.push(v)
  for (let v = 30000; v <= 150000; v += 1000) if (v > lo + 40 && v < hi - 40) values.push(v)
  if (hi > lo) values.push(hi)
  return values
}

function sizesInBudget(rows: SizeRow[], ringLo: number, ringHi: number, settingPrice: number) {
  return rows.filter((r) => r.count > 0 && settingPrice + r.max >= ringLo && settingPrice + r.min <= ringHi).map((r) => r.size)
}

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
  const size = usesBudget && budgetSizes.length ? nearest(budgetSizes, wanted) : Math.min(wanted, Math.max(largest, sizes.min))
  const row = rowAt(rows, size)
  const sizeRing = row ? { lo: settingPrice + row.min, hi: settingPrice + row.max } : null
  const overlap = sizeRing && shopBy === "both" ? { lo: Math.max(sizeRing.lo, budgetLo), hi: Math.min(sizeRing.hi, budgetHi) } : null
  const fits = !overlap || overlap.hi >= overlap.lo
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
    stoneMin: Math.max(0, budgetLo - settingPrice),
    stoneMax: Math.max(0, budgetHi - settingPrice),
  }
}

export type StoneSim = ReturnType<typeof simulate>

export function prefsFilters(shopBy: ShopBy, p: StonePrefs, sim: StoneSim): StoneFilters {
  const f: StoneFilters = { ...emptyStoneFilters(p.type), shapes: [sim.scope.shape], gems: p.type === "gemstone" ? [p.gem] : [] }
  const size = { minSize: Math.max(0, sim.size - sim.sizes.window), maxSize: sim.size + sim.sizes.window }
  const budget = { minPrice: sim.stoneMin, maxPrice: sim.stoneMax }
  if (shopBy === "size") return { ...f, ...size }
  if (shopBy === "budget") return { ...f, ...budget }
  return { ...f, ...size, ...budget }
}

export type FlowStoneStep = "preferences" | "recommendations"

/** /flow/stone (2a) and /flow/stone/recommendations (2b). */
export const flowStonePath = (step: FlowStoneStep, query = "") => `/flow/stone${step === "preferences" ? "" : "/recommendations"}${query}`

/** Entry into the stone step from the Settings PDP: natural diamonds in the shape the shopper came in with. */
export function firstStoneQuery(variant: StonePreferenceVariant["id"], shape: string | null | undefined) {
  const s = shape && STONE_SHAPES.some((x) => x.id === shape) ? shape : DEFAULT_PREFS.shape
  return prefsQuery(variant, { ...DEFAULT_PREFS, shape: s })
}

/** The flow's stone preferences: Test 2 variant from the flow config, priced with the build's setting. */
export function useFlowStonePrefs() {
  const flow = useFlow()
  const { setting } = useRingBuild()
  const variantId = flow?.config.t2 ?? "B"
  const variant = STONE_PREFERENCE_VARIANTS[variantId]
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const prefs = useMemo(() => parse(params), [params])
  const sim = useMemo(() => simulate(variant.shopBy, prefs, setting.price), [variant.shopBy, prefs, setting.price])
  const filters = useMemo(() => prefsFilters(variant.shopBy, prefs, sim), [variant.shopBy, prefs, sim])
  const matching = useMemo(() => (sim.blocked ? [] : filterStones(filters)), [filters, sim.blocked])

  // Remembered for the stepper's and summary's "Edit" on the stone, which return to these preferences.
  const query = prefsQuery(variantId, prefs)
  useEffect(() => {
    try {
      sessionStorage.setItem(FLOW_STONE_QUERY_KEY, query)
    } catch {
      /* storage unavailable: Edit starts from the shape */
    }
  }, [query])

  const update = (patch: Partial<StonePrefs>) => {
    const next = { ...prefs, ...patch }
    navigate(flowStonePath("preferences", prefsQuery(variantId, next)), { replace: true, preventScrollReset: true })
  }
  const setSize = (v: number) => update(prefs.type === "gemstone" ? { mm: v } : { carat: v })
  const href = (step: FlowStoneStep) => flowStonePath(step, prefsQuery(variantId, prefs))

  return { variant, prefs, sim, update, setSize, filters, matching, href, setting }
}
