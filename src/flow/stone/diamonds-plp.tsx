import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { DiamondGlpView } from "@/components/diamond/diamond-glp"
import { FilterSection } from "@/components/diamond/diamond-filters"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import {
  DIAMOND_COLOR_BANDS,
  DIAMOND_EXPLORE_WITH_PRESETS,
  NATURAL_GLP,
  STONE_TYPE_OPTIONS,
  type AppliedChip,
  type GlpCatalog,
} from "@/components/diamond/glp-catalog"
import { GLP_PAGE_SIZE, type DiamondListing, type GlpSort } from "@/components/diamond/use-diamond-listing"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { CutGrade, Shape } from "@/data/diamonds"
import {
  GEMS,
  STONE_SHAPES,
  filterStones,
  gemById,
  gradesFor,
  stonePriceBounds,
  stoneShape,
  stoneTitle,
  stoneType,
  toQuickviewDiamond,
  type LooseStone,
  type StoneFilters,
  type StoneTypeId,
} from "@/data/stones"
import type { DiamondFilterState } from "@/lib/diamond-filters"
import { useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { formatPrice } from "@/lib/format"
import { useFlowStonePrefs as useStonePrefs } from "./simulator"
import { useFlowSelectDiamond } from "./use-flow-stone"

/** The GLP's filter state plus the gemstone kinds (gemstones only). */
type PlpFilters = DiamondFilterState & { gems: string[] }

const INTRO: Record<StoneTypeId, string> = {
  natural: NATURAL_GLP.hero.intro,
  lab: "IGI-certified lab-grown diamonds: the same sparkle and hardness as natural diamonds, at a lower price per carat.",
  gemstone: "Hand-selected gemstones, from amethyst to sapphire, in classic and fancy shapes. Choose the one that’s right for your ring.",
}

const GEM_EXPLORE: GlpCatalog["explore"] = [
  {
    key: "shape",
    label: "Shape",
    copy: "Shape is often the first step in choosing a gemstone. Each shape has its own character, from the timeless brilliance of Round to the distinctive elegance of Oval, Emerald and Pear.",
    learnMore: false,
  },
  { key: "color", label: "Color", copy: "Color runs from Light to Vivid. Richer, more saturated color is rarer and costs more.", learnMore: true },
  { key: "clarity", label: "Clarity", copy: "Clarity grades visible inclusions, from Included to Very Clean. Most colored gemstones have some.", learnMore: true },
]

const SORTERS: Record<GlpSort, (a: LooseStone, b: LooseStone) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "carat-desc": (a, b) => b.size - a.size || b.price - a.price,
  "carat-asc": (a, b) => a.size - b.size || a.price - b.price,
}

const shapeLabel = (id: string) => stoneShape(id).label as Shape
const shapeId = (label: string) => STONE_SHAPES.find((s) => s.label === label)?.id ?? label.toLowerCase()

/** Size bounds from stock: carats to the nearest 0.1 ct, millimetres as Shane Co. offers them. */
function sizeRange(type: StoneTypeId): [number, number] {
  if (type === "gemstone") return [Math.min(...GEMS.map((g) => g.sizeMm.min)), Math.max(...GEMS.map((g) => g.sizeMm.max))]
  let lo = Infinity
  let hi = 0
  for (const s of filterStones({ type, shapes: [], gems: [], minPrice: null, maxPrice: null, minSize: null, maxSize: null, cuts: [], color: null, clarity: null })) {
    lo = Math.min(lo, s.size)
    hi = Math.max(hi, s.size)
  }
  return [Math.floor(lo * 10) / 10, Math.ceil(hi * 10) / 10]
}

/**
 * The GLP catalogue for one Test 2 stone type: the same hero, sidebar and wording as the Diamond GLP, over
 * Test 2's natural, lab-grown or gemstone stock (gemstones in millimetres, with their own grades).
 */
function catalogFor(type: StoneTypeId, back: GlpCatalog["hero"]["back"], onType: (t: StoneTypeId) => void): GlpCatalog {
  const gem = type === "gemstone"
  const g = gradesFor(type)
  const grades = { cut: g.cut.map((x) => x.label), color: g.color.map((x) => x.label), clarity: g.clarity.map((x) => x.label) }
  const price = stonePriceBounds(type)
  const priceBounds: [number, number] = [price.min, price.max]
  const sizeBounds = sizeRange(type)
  const format = gem ? (n: number) => `${n.toFixed(1)} mm` : NATURAL_GLP.size.format
  const noFilters: PlpFilters = {
    price: priceBounds,
    carat: sizeBounds,
    shapes: [],
    cuts: [],
    color: [0, grades.color.length - 1],
    clarity: [0, grades.clarity.length - 1],
    preset: null,
    instore: false,
    gems: [],
  }
  const same = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1]
  // Applied-filter chips, as the GLP's, plus the gemstone kinds.
  const chips = (raw: DiamondFilterState): AppliedChip[] => {
    const f = raw as PlpFilters
    const out: AppliedChip[] = []
    if (!same(f.price, priceBounds)) out.push({ label: `${formatPrice(f.price[0])}–${formatPrice(f.price[1])}`, clear: (s) => ({ ...s, price: priceBounds }) })
    for (const shape of f.shapes) out.push({ label: shape, clear: (s) => ({ ...s, shapes: s.shapes.filter((x) => x !== shape) }) })
    for (const id of f.gems ?? []) out.push({ label: gemById(id).label, clear: (s) => ({ ...s, gems: (s as PlpFilters).gems.filter((x) => x !== id) }) as PlpFilters })
    if (!same(f.carat, sizeBounds))
      out.push({
        label: gem ? `${f.carat[0].toFixed(1)}–${f.carat[1].toFixed(1)} mm` : `${f.carat[0].toFixed(2)}–${f.carat[1].toFixed(2)} ct`,
        clear: (s) => ({ ...s, carat: sizeBounds }),
      })
    for (const cut of f.cuts) out.push({ label: cut, clear: (s) => ({ ...s, cuts: s.cuts.filter((x) => x !== cut), preset: null }) })
    if (!same(f.color, noFilters.color))
      out.push({ label: `Color ${grades.color[f.color[0]]}–${grades.color[f.color[1]]}`, clear: (s) => ({ ...s, color: noFilters.color, preset: null }) })
    if (!same(f.clarity, noFilters.clarity))
      out.push({ label: `${grades.clarity[f.clarity[0]]}–${grades.clarity[f.clarity[1]]}`, clear: (s) => ({ ...s, clarity: noFilters.clarity, preset: null }) })
    return out
  }
  return {
    hero: { title: stoneType(type).plpLabel, intro: INTRO[type], back, type: { value: type, options: STONE_TYPE_OPTIONS, onChange: (t) => onType(t as StoneTypeId) } },
    explore: gem ? GEM_EXPLORE : DIAMOND_EXPLORE_WITH_PRESETS,
    priceLabel: gem ? "Gemstone Price" : "Diamond Price",
    priceBounds,
    size: gem
      ? { label: "Gemstone Size", info: "Gemstones are sized in millimeters across the stone, as Shane Co. sells them.", bounds: sizeBounds, step: 0.5, format }
      : { ...NATURAL_GLP.size, bounds: sizeBounds },
    noFilters,
    grades,
    cutHint: Object.fromEntries(g.cut.map((x) => [x.label, x.detail ?? ""])),
    info: gem
      ? {
          cut: "Cut decides how a gemstone shows its color and brilliance.",
          color: "Color runs from Light to Vivid. Richer, more saturated color is rarer and costs more.",
          clarity: "Clarity grades visible inclusions, from Included to Very Clean.",
        }
      : { ...NATURAL_GLP.info, color: "Color grade helps compare diamonds from D (brightest white) to M (warmest tone)." },
    colorBands: gem ? undefined : DIAMOND_COLOR_BANDS,
    presets: !gem,
    certification:
      type === "natural" ? NATURAL_GLP.certification : type === "lab" ? "All our lab-grown diamonds are IGI certified." : "Every gemstone is graded by Shane Co. gemologists.",
    banner: !gem,
    chips,
    extraFilters: gem
      ? (raw, onChange) => {
          const value = raw as PlpFilters
          return (
            <FilterSection title="Gemstone">
              <div className="flex flex-col gap-2">
                {GEMS.map((gm) => {
                  const on = value.gems.includes(gm.id)
                  return (
                    <label key={gm.id} htmlFor={`gem-${gm.id}`} className="flex cursor-pointer items-center gap-3 py-1">
                      <Checkbox
                        id={`gem-${gm.id}`}
                        checked={on}
                        onCheckedChange={(c) => onChange({ ...value, gems: c ? [...value.gems, gm.id] : value.gems.filter((x) => x !== gm.id) } as PlpFilters)}
                      />
                      <img src={gm.icon} alt="" className="size-5" />
                      <span className="text-sm leading-none font-medium text-foreground">{gm.label}</span>
                    </label>
                  )
                })}
              </div>
            </FilterSection>
          )
        }
      : undefined,
  }
}

/** Test 2's filters (from the shopper's preferences) as the GLP's filter state. */
function fromStoneFilters(f: StoneFilters, none: PlpFilters): PlpFilters {
  const clamp = (v: number | null, [lo, hi]: [number, number], fallback: number) => (v === null ? fallback : Math.min(hi, Math.max(lo, v)))
  const grades = gradesFor(f.type)
  return {
    ...none,
    price: [clamp(f.minPrice, none.price, none.price[0]), clamp(f.maxPrice, none.price, none.price[1])],
    carat: [clamp(f.minSize, none.carat, none.carat[0]), clamp(f.maxSize, none.carat, none.carat[1])],
    shapes: f.shapes.map(shapeLabel),
    gems: f.gems,
    cuts: f.cuts.map((i) => grades.cut[i].label as CutGrade),
    color: f.color ?? none.color,
    clarity: f.clarity ?? none.clarity,
  }
}

/** The GLP's filter state back to Test 2's stone filters. */
function toStoneFilters(f: PlpFilters, type: StoneTypeId): StoneFilters {
  const cuts = gradesFor(type).cut.map((x) => x.label)
  return {
    type,
    shapes: f.shapes.map(shapeId),
    gems: f.gems ?? [],
    minPrice: f.price[0],
    maxPrice: f.price[1],
    minSize: f.carat[0],
    maxSize: f.carat[1],
    cuts: f.cuts.map((c) => cuts.indexOf(c)).filter((i) => i >= 0),
    color: f.color,
    clarity: f.clarity,
  }
}

function matching(f: PlpFilters, type: StoneTypeId) {
  const list = filterStones(toStoneFilters(f, type))
  return f.instore ? list.filter((s) => toQuickviewDiamond(s).instore) : list
}

/**
 * Full DYO flow · Diamonds PLP ("View All" from the stone step). A copy of Test 2's PLP
 * (src/pages/test-2/diamonds-plp.tsx, Lewis's Diamond GLP over Test 2's stock) so Test 2 stays untouched:
 * the picks and this list are the same stones. Differences: flow URLs and variant, natural diamonds only,
 * tiles open the Quickview (flow t31 B) or the Diamond PDP (t31 A), Select puts the stone in the build and
 * moves on to step 3, and Full Details opens the Diamond PDP. Keep it in sync with Test 2.
 */
export function FlowDiamondsPlp() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const flow = useFlow()
  const selectDiamond = useFlowSelectDiamond()
  const opensQuickview = flow?.config.t31 !== "A"
  const toPdp = (id: string) => {
    navigate(flow ? flow.path(FLOW_ROUTES.diamond(id)) : FLOW_ROUTES.diamond(id))
    window.scrollTo({ top: 0 })
  }
  const [params] = useSearchParams()
  const { variant, filters: preset, href } = useStonePrefs()
  const from = params.get("from") === "recs" ? "recs" : "prefs"
  const back = useMemo(
    () => ({
      label: from === "recs" ? "Back to your recommendations" : "Back to stone preferences",
      onClick: () => navigate(href(from === "recs" ? "recommendations" : "preferences")),
      inBar: true,
    }),
    [from, navigate, href],
  )

  const [type, setType] = useState<StoneTypeId>(preset.type)
  const [state, setState] = useState(() => ({
    filters: fromStoneFilters(preset, catalogFor(preset.type, back, () => {}).noFilters as PlpFilters),
    sort: "popular" as GlpSort,
    page: 1,
  }))
  const [quickview, setQuickview] = useState<LooseStone | null>(null)

  // A new type has its own price, size and grade scales (carats vs millimetres): keep the shapes, reset the rest.
  const switchType = (next: StoneTypeId) => {
    // The flow carries natural diamonds only for now.
    if (next !== "natural") return notInTest("Lab-grown diamonds and gemstones")
    const none = catalogFor(next, back, () => {}).noFilters as PlpFilters
    setType(next)
    setState((s) => ({ ...s, page: 1, filters: { ...none, shapes: s.filters.shapes } }))
  }
  const catalog = catalogFor(type, back, switchType)

  const stones = useMemo(() => matching(state.filters, type).sort(SORTERS[state.sort]), [state.filters, state.sort, type])
  const byId = useMemo(() => new Map(stones.map((s) => [s.id, s])), [stones])
  const results = useMemo(() => stones.map(toQuickviewDiamond), [stones])
  const pageCount = Math.max(1, Math.ceil(results.length / GLP_PAGE_SIZE))
  const page = Math.min(state.page, pageCount)

  const listing: DiamondListing = {
    filters: state.filters,
    sort: state.sort,
    page,
    pageCount,
    results,
    pageItems: results.slice((page - 1) * GLP_PAGE_SIZE, page * GLP_PAGE_SIZE),
    activeCount: catalog.chips(state.filters).length,
    setFilters: (filters) => setState((s) => ({ ...s, filters: filters as PlpFilters, page: 1 })),
    setSort: (sort) => setState((s) => ({ ...s, sort, page: 1 })),
    setPage: (p) => setState((s) => ({ ...s, page: p })),
    clearAll: () => setState((s) => ({ ...s, filters: catalog.noFilters as PlpFilters, page: 1 })),
    countFor: (f) => matching(f as PlpFilters, type).length,
  }

  // Arriving from 2a/2b starts at the top of the listing page.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const kind = type === "gemstone" ? "Gemstone" : "Diamond"
  return (
    <div data-variant={variant.id}>
      <DiamondGlpView
        listing={listing}
        catalog={catalog}
        stepper={<DyoStepper current={2} mobileLabel="Stone" showTotal={false} mobileTone="plp" contained />}
        tileTitle={(d) => {
          const s = byId.get(d.id)
          return s ? stoneTitle(s) : d.id
        }}
        onOpen={(d) => (opensQuickview ? setQuickview(byId.get(d.id) ?? null) : toPdp(d.id))}
        stickyBar={<BackBar label={back.label} onBack={back.onClick} />}
      />
      {/* The GLP's Quickview: selecting puts the stone in the build; Full Details opens the Diamond PDP. */}
      <DiamondQuickview
        diamond={quickview && toQuickviewDiamond(quickview)}
        title={quickview ? stoneTitle(quickview) : undefined}
        noun={kind}
        certificate={type === "gemstone" ? null : undefined}
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={() => {
          const picked = quickview
          setQuickview(null)
          if (picked) selectDiamond(toQuickviewDiamond(picked))
        }}
        onViewDetails={() => {
          const picked = quickview
          setQuickview(null)
          if (picked) toPdp(picked.id)
        }}
      />
    </div>
  )
}

/**
 * Full flows: the way back from the listing, at the top of the hero (where the setting PLP has its
 * breadcrumb). On desktop it stays under the header as the results scroll; on phones the stepper bar takes
 * that spot, so it stays at the top of the hero. Serves both ways in: "View all stones" on the stone step
 * (back to stone preferences) and on the recommendations (back to them).
 */
function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <>
      {/* 8px of banner above the 40px bar puts the link where the setting PLP has its breadcrumb (20px under
          the header), while the bar itself keeps the link centred when it sticks under the header. */}
      <div aria-hidden className="h-2 bg-secondary" />
      <div className="z-20 bg-secondary transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset)">
        <div className="flex h-10 items-center px-page">
          <Button variant="link" className="h-auto gap-1 px-0 py-0" onClick={onBack}>
            <CaretLeftIcon /> {label}
          </Button>
        </div>
      </div>
    </>
  )
}
