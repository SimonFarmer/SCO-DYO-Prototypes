import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { useNotInTest } from "@/components/prototype/not-in-test"
import {
  BudgetLine,
  ConfigHeader,
  GemSelector,
  PriceExplained,
  ShapeSelector,
  SizeLine,
  StockNote,
  StoneTypeToggle,
} from "@/components/stones/preference-parts"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Diamond } from "@/data/diamonds"
import {
  formatSize,
  gemById,
  recommend,
  shapesFor,
  snapSize,
  stoneImage,
  stoneShape,
  stoneSpecs,
  stoneTitle,
  stoneType,
  type LooseStone,
  type SpecKey,
  type StonePick,
} from "@/data/stones"
import { useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { useFlowSelectDiamond } from "@/flow/stone/use-flow-stone"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ShopBy } from "@/pages/test-2/variants"
import { glpCountFor, pickAsDiamond, seedFlowGlp } from "./stone-bridge"
import { useFlowStonePrefs, type StonePrefs, type StoneSim } from "./simulator"
import { FlowStoneStepLayout } from "./stone-step-layout"

/*
 * Full DYO flow · stone step (2a preferences, 2b recommendations). Copies of Test 2's pages
 * (src/pages/test-2/index.tsx, recommendations.tsx) so Test 2 stays untouched. Differences:
 *  - priced with the flow's setting (Ella Cathedral in the chosen metal);
 *  - natural diamonds only (other stone types show the "not part of this test" notice);
 *  - View All opens the flow GLP with the preferences carried over, and counts what it will show;
 *  - a pick's "View details" opens the Quickview or Diamond PDP (flow t31), and selecting a stone
 *    puts it in the build.
 * Keep visual fixes in sync with Test 2.
 */

const r5 = (n: number) => Math.round(n / 5) * 5
const range = (a: number, b: number) => `${formatPrice(r5(a))} - ${formatPrice(r5(b))}`

function stoneName(p: StonePrefs, shapeId: string) {
  const shape = stoneShape(shapeId).label
  return p.type === "gemstone" ? `${shape} ${gemById(p.gem).label}` : `${shape} ${stoneType(p.type).noun}`
}

function SizeSection({ sim, setSize, withBand }: { sim: StoneSim; setSize: (v: number) => void; withBand: boolean }) {
  const band = withBand && sim.budgetSizes.length ? { from: sim.budgetSizes[0], to: sim.budgetSizes[sim.budgetSizes.length - 1] } : null
  const noBudgetStock = withBand && !sim.available
  return (
    <section className="flex flex-col gap-4">
      <ConfigHeader
        title={sim.sizes.unit === "ct" ? "Carat Size" : "Gemstone Size"}
        aside={noBudgetStock ? undefined : { label: "Preview Size", value: formatSize(sim.size, sim.sizes.unit) }}
      />
      {noBudgetStock ? (
        <StockNote>No stones at this budget. Try widening it.</StockNote>
      ) : (
        <SizeLine scale={sim.sizes} value={sim.size} onChange={(v) => setSize(snapSize(v, sim.sizes))} largest={sim.largest} band={band} />
      )}
    </section>
  )
}

function BudgetSection({ sim, update, interactive, withBand }: { sim: StoneSim; update: (p: Partial<StonePrefs>) => void; interactive: boolean; withBand: boolean }) {
  return (
    <section className="flex flex-col gap-6">
      <ConfigHeader title={interactive ? "Set your Total Ring Budget" : "Total Ring Budget"} />
      {!interactive && !sim.row ? (
        <StockNote>No stones available at this size right now. Try a nearby size to see prices.</StockNote>
      ) : (
        <BudgetLine
          scale={sim.scale}
          lo={sim.budgetLo}
          hi={sim.budgetHi}
          onChange={interactive ? (budgetLo, budgetHi) => update({ budgetLo, budgetHi }) : undefined}
          band={withBand ? sim.sizeRing : null}
        />
      )}
    </section>
  )
}

/** "View All (N)": seeds the flow GLP with the preferences and opens it. */
function useViewAll() {
  const flow = useFlow()
  const navigate = useNavigate()
  return (filters: Parameters<typeof seedFlowGlp>[0]) => {
    seedFlowGlp(filters)
    navigate(flow ? flow.path(FLOW_ROUTES.diamonds) : FLOW_ROUTES.diamonds)
    window.scrollTo({ top: 0 })
  }
}

/** 2a · Stone preferences (Test 2 variant from the flow config, default B: budget first). */
export function FlowStonePreferences() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const viewAll = useViewAll()
  const { variant, prefs, sim, update, setSize, filters, matching, href, setting } = useFlowStonePrefs()
  const { shopBy } = variant
  const set = setting.price

  const stonePrice =
    shopBy === "both"
      ? sim.overlap
        ? range(sim.overlap.lo - set, sim.overlap.hi - set)
        : "—"
      : sim.blocked || !sim.row
        ? "—"
        : range(sim.row.min, sim.row.max)
  const total =
    shopBy === "size"
      ? sim.sizeRing
        ? range(sim.sizeRing.lo, sim.sizeRing.hi)
        : "—"
      : shopBy === "budget"
        ? `${formatPrice(sim.budgetLo)} - ${formatPrice(sim.budgetHi)}`
        : sim.overlap
          ? range(sim.overlap.lo, sim.overlap.hi)
          : "—"

  const size = <SizeSection sim={sim} setSize={setSize} withBand={shopBy !== "size"} />
  const budget = <BudgetSection sim={sim} update={update} interactive={shopBy !== "size"} withBand={shopBy === "size"} />

  return (
    <div data-variant={variant.id}>
      <FlowStoneStepLayout prefs={prefs} size={sim.size}>
        <StepIntro
          eyebrow="Step 2 of 3 · Stone"
          title="Find your Stone"
          subtitle="Tell us what you're looking for and we'll recommend stones to suit your ring and budget."
        />
        <SectionDivider />
        {/* The flow carries natural diamonds only (Test 3's catalog). */}
        <StoneTypeToggle value={prefs.type} onChange={(type) => (type === "natural" ? update({ type }) : notInTest("Lab-grown diamonds and gemstones"))} />
        <ShapeSelector value={sim.scope.shape} onChange={(shape) => update({ shape })} offered={shapesFor(prefs.type, prefs.gem)} />
        {prefs.type === "gemstone" && <GemSelector value={prefs.gem} onChange={(gem) => update({ gem })} />}
        <SectionDivider />
        {shopBy === "size" ? (
          <>
            {size}
            {budget}
          </>
        ) : (
          <>
            {budget}
            {size}
          </>
        )}
        <PriceExplained
          rows={[
            { label: "Setting", desc: setting.name, price: formatPrice(set) },
            {
              label: "Stone",
              desc: (
                <>
                  {stoneName(prefs, sim.scope.shape)} (<span className="font-semibold">{formatSize(sim.size, sim.sizes.unit)} ±</span>
                  {shopBy === "both" && ", in your budget"})
                </>
              ),
              price: stonePrice,
            },
          ]}
          total={total}
        />
        {sim.blocked && (
          <p className="-mb-4 text-xs leading-4 text-muted-foreground">
            {shopBy === "size"
              ? "No stones are available at this size right now. Choose a different size to continue."
              : "No stones in this budget right now. Widen your budget to continue."}
          </p>
        )}
        <StoneCtas
          primary="View Recommended Stones"
          onPrimary={() => navigate(href("recommendations"))}
          primaryDisabled={sim.blocked || matching.length === 0}
          viewAllDisabled={sim.blocked}
          shape={prefs.shape}
          count={sim.blocked ? 0 : glpCountFor(filters)}
          onViewAll={() => viewAll(filters)}
        />
      </FlowStoneStepLayout>
    </div>
  )
}

function basis(shopBy: ShopBy, sim: StoneSim) {
  const size = formatSize(sim.size, sim.sizes.unit)
  const budget = `${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)}`
  const lead = "Our three stone picks for you."
  if (shopBy === "size") return `${lead} Based on your preferred size of ${size}.`
  if (shopBy === "budget") return `${lead} Based on your ring budget of ${budget}.`
  return `${lead} Based on your preferred size of ${size} and ring budget of ${budget}.`
}

function SpecStrip({ pick }: { pick: StonePick }) {
  const specs = stoneSpecs(pick.stone)
  const cells: { key: SpecKey; label: string; value: string }[] = [
    pick.stone.type === "gemstone"
      ? { key: "size", label: "Size", value: `${pick.stone.size.toFixed(1)} mm` }
      : { key: "size", label: "Carat", value: `${pick.stone.carat.toFixed(2)} ct` },
    { key: "clarity", label: "Clarity", value: specs.clarity },
    { key: "color", label: "Color", value: specs.color },
    { key: "cut", label: "Cut", value: specs.cut },
  ]
  return (
    <dl className="grid grid-cols-2 gap-px border-y border-border-subtle bg-border-subtle md:grid-cols-4">
      {cells.map((c) => {
        const on = pick.highlight.includes(c.key)
        return (
          <div key={c.key} className={cn("flex min-w-0 flex-col gap-0.5 px-2 py-1.25", on ? "bg-secondary" : "bg-background")}>
            <dt className="text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase">{c.label}</dt>
            <dd className={cn("text-xs leading-4 text-primary [overflow-wrap:anywhere] tabular-nums", on ? "font-semibold" : "tracking-[0.12px]")}>{c.value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

function PickTile({
  pick,
  selected,
  settingPrice,
  onSelect,
  onViewDetails,
}: {
  pick: StonePick
  selected: boolean
  settingPrice: number
  onSelect: () => void
  onViewDetails: () => void
}) {
  const img = stoneImage(pick.stone)
  const ringTotal = `Ring Total: ${formatPrice(settingPrice + pick.stone.price)}`
  return (
    <div
      onClick={onSelect}
      className={cn("flex cursor-pointer items-start gap-3 bg-background md:gap-5", selected ? "border-2 border-primary p-3.75" : "border border-border-subtle p-4 hover:border-border")}
    >
      <div className="size-13.5 shrink-0 overflow-hidden bg-secondary">
        <img
          src={img.src}
          alt=""
          className={cn("size-full", img.render ? "origin-[50%_30%] scale-[2.4] object-contain" : img.photo ? "object-cover" : "object-contain p-2.5 mix-blend-multiply")}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-5 items-center bg-secondary px-2 text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase">{pick.label}</span>
            <RadioGroupItem value={pick.kind} aria-label={`${pick.label}: ${stoneTitle(pick.stone)}`} className="border-primary" />
          </div>
          <div className="flex flex-col gap-1.5 text-primary md:flex-row md:items-start md:gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm leading-5 font-semibold">{stoneTitle(pick.stone)}</p>
              <p className="text-xs leading-4 tracking-[0.12px]">{pick.summary}</p>
            </div>
            <div className="flex shrink-0 items-baseline gap-2 whitespace-nowrap md:flex-col md:items-end md:gap-0.5">
              <p className="text-sm leading-5 font-semibold">{formatPrice(pick.stone.price)}</p>
              <p className="text-xs leading-4 tracking-[0.12px]">{ringTotal}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <SpecStrip pick={pick} />
          <p className="text-xs leading-4 font-semibold text-primary">Optimized for {pick.optimizedFor}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails()
          }}
          className="cursor-pointer self-start type-label-xs text-primary underline"
        >
          View details
        </button>
      </div>
    </div>
  )
}

function RingSummaryBox({ stone, setting }: { stone: LooseStone; setting: { name: string; metal: string; price: number } }) {
  const rows = [
    { label: `Setting: ${setting.name.replace(/ Engagement Ring$/, "")}, ${setting.metal.replace("14K", "14k")}`, price: setting.price },
    { label: `Stone: ${stoneTitle(stone)}`, price: stone.price },
  ]
  return (
    <div className="flex flex-col gap-4 bg-bg-input-50 p-4" aria-live="polite">
      <h2 className="type-h4 text-primary">Ring Summary</h2>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4">
            <p className="text-xs leading-4 font-medium text-primary">{r.label}</p>
            <p className="text-sm leading-none font-semibold whitespace-nowrap text-muted-foreground">{formatPrice(r.price)}</p>
          </div>
        ))}
      </div>
      <div className="h-px bg-border-subtle" />
      <div className="flex items-start justify-between gap-4 text-base leading-6 font-semibold text-primary">
        <span>Ring Total:</span>
        <span className="whitespace-nowrap">{formatPrice(setting.price + stone.price)}</span>
      </div>
    </div>
  )
}

/** 2b · Stone recommendations: three picks from stock for the shopper's preferences. */
export function FlowStoneRecommendations() {
  const navigate = useNavigate()
  const flow = useFlow()
  const viewAll = useViewAll()
  const selectDiamond = useFlowSelectDiamond()
  const { variant, prefs, sim, filters, href, setting } = useFlowStonePrefs()
  const { shopBy } = variant
  const picks = useMemo(
    () => (sim.blocked ? [] : recommend({ scope: sim.scope, mode: shopBy, size: sim.size, stoneMin: sim.stoneMin, stoneMax: sim.stoneMax })),
    [sim, shopBy],
  )
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const [quickview, setQuickview] = useState<Diamond | null>(null)
  const opensQuickview = flow?.config.t31 !== "A"

  // Same as a GLP tile: Quickview (t31 B) or straight to the Diamond PDP (t31 A).
  const viewDetails = (stone: LooseStone) => {
    const d = pickAsDiamond(stone)
    if (opensQuickview) setQuickview(d)
    else {
      navigate(flow ? flow.path(FLOW_ROUTES.diamond(d.id)) : FLOW_ROUTES.diamond(d.id))
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <div data-variant={variant.id}>
      <FlowStoneStepLayout prefs={prefs} size={selected?.stone.size ?? sim.size} gallery="full">
        <header className="flex flex-col gap-8 max-lg:gap-4">
          <StepIntro eyebrow="Step 2 of 3 · Stone" title="Stone Recommendations" subtitle={basis(shopBy, sim)} />
          <button
            type="button"
            onClick={() => navigate(href("preferences"))}
            className="flex h-6 cursor-pointer items-center gap-0.5 self-start type-label-xs text-primary underline"
          >
            <CaretLeftIcon className="size-4" />
            Edit preferences
          </button>
        </header>
        <SectionDivider />
        {selected ? (
          <>
            <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-2">
              {picks.map((p) => (
                <PickTile
                  key={p.kind}
                  pick={p}
                  selected={p.kind === selected.kind}
                  settingPrice={setting.price}
                  onSelect={() => setSelectedKind(p.kind)}
                  onViewDetails={() => viewDetails(p.stone)}
                />
              ))}
            </RadioGroup>
            <SectionDivider />
            <RingSummaryBox stone={selected.stone} setting={setting} />
          </>
        ) : (
          <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
            <p className="type-h5 text-primary">No stones match these preferences</p>
            <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
          </div>
        )}
        <StoneCtas
          primary="Select This Diamond"
          onPrimary={() => selected && selectDiamond(pickAsDiamond(selected.stone))}
          primaryDisabled={!selected}
          viewAllDisabled={sim.blocked}
          shape={prefs.shape}
          count={sim.blocked ? 0 : glpCountFor(filters)}
          onViewAll={() => viewAll(filters)}
        />
      </FlowStoneStepLayout>
      {opensQuickview && (
        <DiamondQuickview
          diamond={quickview}
          onOpenChange={(open) => !open && setQuickview(null)}
          onSelect={(d) => {
            setQuickview(null)
            selectDiamond(d)
          }}
          onViewDetails={(d) => {
            setQuickview(null)
            navigate(flow ? flow.path(FLOW_ROUTES.diamond(d.id)) : FLOW_ROUTES.diamond(d.id))
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </div>
  )
}
