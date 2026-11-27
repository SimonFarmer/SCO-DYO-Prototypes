import { useNavigate } from "react-router"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import {
  BudgetLine,
  ConfigHeader,
  GemSelector,
  PriceExplained,
  ShapeSelector,
  SizeLine,
  StockNote,
  StoneTypeToggle,
  useSectionClass,
} from "@/components/stones/preference-parts"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { formatSize, gemById, shapesFor, snapSize, stoneShape, stoneType } from "@/data/stones"
import { useFlowStoneTypes, useStudyViewAll } from "@/flow/study/study"
import { formatPrice } from "@/lib/format"
import type { ShopBy } from "@/pages/test-2/variants"
import { useFlowStonePrefs, type StonePrefs, type StoneSim } from "./simulator"
import { useStepNumber } from "@/flow/flow-context"
import { FlowStoneStepLayout as StoneStepLayout } from "./stone-step-layout"

/** Ranges to the nearest $5, so the exact end prices show (concept). */
const r5 = (n: number) => Math.round(n / 5) * 5
const range = (a: number, b: number) => `${formatPrice(r5(a))} - ${formatPrice(r5(b))}`

/** "Round Natural Diamond", "Oval Ruby" */
export function stoneName(p: StonePrefs, shapeId: string) {
  const shape = stoneShape(shapeId).label
  return p.type === "gemstone" ? `${shape} ${gemById(p.gem).label}` : `${shape} ${stoneType(p.type).noun}`
}

/**
 * Size + Budget over budget (Test 2 C, full-flow study): the stone price in red and a red note under it. The note
 * slot stays (null within budget) so it slides in and out.
 */
export function overBudget(sim: StoneSim, shopBy: ShopBy): { over?: boolean; note?: string | null } {
  if (shopBy !== "both") return {}
  return { over: sim.overBy !== null, note: sim.overBy ? `Selection is +${formatPrice(sim.overBy)} above your budget` : null }
}

/**
 * Size section: carats for diamonds, millimetres for gemstones (as shaneco.com). In the budget modes the
 * green band is the sizes in stock at the budget. Budget first holds the handle inside it (the chosen size
 * is kept in the URL, so widening the budget restores it); Size + Budget lets it go outside.
 */
export function SizeSection({ sim, setSize, shopBy }: { sim: StoneSim; setSize: (v: number) => void; shopBy: ShopBy }) {
  const withBand = shopBy !== "size"
  const band = withBand && sim.budgetSizes.length ? { from: sim.budgetSizes[0], to: sim.budgetSizes[sim.budgetSizes.length - 1] } : null
  // Budget first can't show a size with nothing in the budget; Size + Budget still can.
  const noBudgetStock = shopBy === "budget" && !sim.available
  return (
    <section className="flex flex-col gap-4">
      <ConfigHeader
        title={sim.sizes.unit === "ct" ? "Carat Size" : "Gemstone Size"}
        aside={noBudgetStock ? undefined : { label: "Preview Size", value: formatSize(sim.size, sim.sizes.unit) }}
      />
      {noBudgetStock ? (
        <StockNote>No stones at this budget. Try widening it.</StockNote>
      ) : (
        <SizeLine
          scale={sim.sizes}
          value={sim.size}
          onChange={(v) => setSize(snapSize(v, sim.sizes))}
          largest={sim.largest}
          band={band}
          over={sim.overBy !== null}
        />
      )}
    </section>
  )
}

/** Total ring budget section. Handles in the budget modes; in Carat first, only the size's price band. */
export function BudgetSection({ sim, update, interactive, withBand }: { sim: StoneSim; update: (p: Partial<StonePrefs>) => void; interactive: boolean; withBand: boolean }) {
  const section = useSectionClass()
  return (
    <section className={section}>
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
          projection={sim.overBy ? sim.sizeRing?.lo : null}
        />
      )}
    </section>
  )
}

/**
 * Full DYO flow · 2a Stone preferences. A copy of Test 2's page (src/pages/test-2/index.tsx, re-synced with
 * Lewis's version) so Test 2 stays untouched. Differences: the flow's t2 variant, prices with the flow's
 * setting (Ella Cathedral), flow URLs, and natural diamonds only (other types show "not part of this test").
 * Keep it in sync with Test 2.
 */
export function FlowStonePreferences() {
  const navigate = useNavigate()
  const viewAll = useStudyViewAll()
  const stoneTypes = useFlowStoneTypes()
  const { variant, prefs, sim, update, setSize, matching, prices, href, setting } = useFlowStonePrefs()
  const stoneStep = useStepNumber("stone")
  const { shopBy } = variant
  const set = setting.price

  // Price Explained: the stones that match (what View All lists), so Setting + Stone adds up to the Ring Total.
  const stonePrice = prices ? range(prices.stone.lo, prices.stone.hi) : "—"
  const total = prices ? range(prices.ring.lo, prices.ring.hi) : "—"

  const size = <SizeSection sim={sim} setSize={setSize} shopBy={shopBy} />
  const budget = <BudgetSection sim={sim} update={update} interactive={shopBy !== "size"} withBand={shopBy === "size"} />

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} size={sim.size}>
        <StepIntro
          eyebrow={`Step ${stoneStep} of 3 · Stone`}
          title="Find your Stone"
          subtitle="Tell us what you're looking for and we'll recommend stones to suit your ring and budget."
        />
        <SectionDivider />
        {/* Natural diamonds, plus lab-grown in the study; the rest show "not part of this test". */}
        <StoneTypeToggle value={prefs.type} onChange={(type) => (stoneTypes.carries(type) ? update({ type }) : stoneTypes.notCarried())} />
        <ShapeSelector value={sim.scope.shape} onChange={(shape) => update({ shape })} offered={shapesFor(prefs.type, prefs.gem)} />
        {prefs.type === "gemstone" && <GemSelector value={prefs.gem} onChange={(gem) => update({ gem })} />}
        <SectionDivider />
        {/* Carat first leads with size; the budget modes lead with the budget handles. */}
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
                  {/* Over budget, the red line under the row says so (Test 2 C). */}
                  {shopBy === "both" && !sim.overBy && (sim.inBudget ? ", in your budget" : ", outside your budget")})
                </>
              ),
              price: stonePrice,
              ...overBudget(sim, shopBy),
            },
          ]}
          total={total}
        />
        {sim.blocked && (
          <p className="-mb-4 text-xs leading-4 text-muted-foreground">
            {shopBy !== "budget"
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
          count={matching.length}
          onViewAll={viewAll.guard(() => navigate(href("diamonds", { from: "prefs" })))}
        />
      </StoneStepLayout>
    </div>
  )
}
