import { countMatches } from "@/components/diamond/use-diamond-listing"
import {
  CLARITY_GRADES,
  COLOR_GRADES,
  CUT_GRADES,
  DIAMONDS,
  SHAPES,
  findDiamond,
  type Diamond,
  type Shape,
} from "@/data/diamonds"
import { STONES, stoneShape, stoneSpecs, type LooseStone, type StoneFilters } from "@/data/stones"
import { FLOW_GLP_KEY } from "@/flow/flow-paths"
import { CARAT_BOUNDS, NO_FILTERS, PRICE_BOUNDS, type DiamondFilterState } from "@/lib/diamond-filters"

/**
 * Bridges the two stone catalogs in the flow. The stone preferences and recommendations come from
 * Test 2's catalog (data/stones.ts); the GLP, Quickview and Diamond PDP from Test 3's (data/diamonds.ts).
 * The flow is natural diamonds only, so both speak "natural diamond" and this maps between them.
 */

const toShape = (id: string): Shape | undefined => SHAPES.find((s) => s.toLowerCase() === id.toLowerCase())
const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v))

/** The GLP filters for the shopper's stone preferences: shape, plus the stone budget and/or carat window. */
export function glpFiltersFor(f: StoneFilters): DiamondFilterState {
  const shapes = f.shapes.map(toShape).filter((s): s is Shape => !!s)
  const price: [number, number] = [
    f.minPrice != null ? clamp(f.minPrice, PRICE_BOUNDS) : PRICE_BOUNDS[0],
    f.maxPrice != null ? clamp(f.maxPrice, PRICE_BOUNDS) : PRICE_BOUNDS[1],
  ]
  const carat: [number, number] = [
    f.minSize != null ? clamp(Math.round(f.minSize * 100) / 100, CARAT_BOUNDS) : CARAT_BOUNDS[0],
    f.maxSize != null ? clamp(Math.round(f.maxSize * 100) / 100, CARAT_BOUNDS) : CARAT_BOUNDS[1],
  ]
  return { ...NO_FILTERS, shapes, price, carat }
}

/** "View All (N)" in the flow counts what the GLP will actually show. */
export const glpCountFor = (f: StoneFilters) => countMatches(glpFiltersFor(f))

/** Opens the flow GLP on these filters (first page, default sort), as Test 2's PLP hand-off does. */
export function seedFlowGlp(f: StoneFilters) {
  try {
    sessionStorage.setItem(FLOW_GLP_KEY, JSON.stringify({ filters: glpFiltersFor(f), sort: "popular", page: 1 }))
  } catch {
    /* storage unavailable: the GLP opens unfiltered */
  }
}

/** Face-up diameter of a round brilliant (mm) for a carat weight, as data/diamonds.ts derives it. */
const roundDiameter = (carat: number) => Math.round(6.5 * Math.cbrt(carat) * 100) / 100

/** Stable small number from a string, for serials and photo choice. */
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

/**
 * A recommended stone as a Diamond, so "View details" opens the same Quickview and Diamond PDP as the GLP.
 * Price, carat, shape and grades are the pick's own; measurements and report details are derived.
 */
export function pickAsDiamond(s: LooseStone): Diamond {
  const specs = stoneSpecs(s)
  const shape = toShape(stoneShape(s.shape).label) ?? "Round"
  const h = hash(s.id)
  const d = roundDiameter(s.carat)
  const sameShape = DIAMONDS.filter((x) => x.shape === shape)
  return {
    id: `pick-${s.id}`,
    serial: String(70000000 + (h % 9000000)),
    shape,
    carat: s.carat,
    cut: (CUT_GRADES as readonly string[]).includes(specs.cut) ? (specs.cut as Diamond["cut"]) : "Excellent",
    color: (COLOR_GRADES as readonly string[]).includes(specs.color) ? (specs.color as Diamond["color"]) : "H",
    clarity: (CLARITY_GRADES as readonly string[]).includes(specs.clarity) ? (specs.clarity as Diamond["clarity"]) : "VS2",
    price: s.price,
    table: 56 + (h % 4),
    depth: Math.round((61 + (h % 20) / 10) * 10) / 10,
    girdle: "Medium",
    culet: "None",
    lengthMm: d,
    widthMm: shape === "Round" ? Math.round((d - 0.02) * 100) / 100 : Math.round(d * 0.75 * 100) / 100,
    lwRatio: shape === "Round" ? 1 : 1.33,
    // A photo of the same shape from the GLP catalog.
    image: (sameShape[h % Math.max(1, sameShape.length)] ?? DIAMONDS[0]).image,
    instore: h % 5 === 2,
  }
}

/** A flow diamond by id: a GLP stone, or a recommended pick ("pick-…"). */
export function findFlowDiamond(id: string | undefined): Diamond | undefined {
  if (!id) return undefined
  if (id.startsWith("pick-")) {
    const stone = STONES.find((s) => `pick-${s.id}` === id)
    return stone ? pickAsDiamond(stone) : undefined
  }
  return findDiamond(id)
}
