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
} from "@/components/stones/preference-parts"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { SETTING } from "@/data/dyo"
import { formatSize, gemById, shapesFor, snapSize, stoneShape, stoneType } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { useStonePrefs, type StonePrefs, type StoneSim } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"

/** Ranges to the nearest $5, so the exact end prices show (concept). */
const r5 = (n: number) => Math.round(n / 5) * 5
const range = (a: number, b: number) => `${formatPrice(r5(a))} - ${formatPrice(r5(b))}`

/** "Round Natural Diamond", "Oval Ruby" */
function stoneName(p: StonePrefs, shapeId: string) {
  const shape = stoneShape(shapeId).label
  return p.type === "gemstone" ? `${shape} ${gemById(p.gem).label}` : `${shape} ${stoneType(p.type).noun}`
}

/**
 * Size section: carats for diamonds, millimetres for gemstones (as shaneco.com). In the budget modes the
 * green band is the sizes in stock at the budget and the handle is held inside it (the chosen size is
 * kept in the URL, so widening the budget restores it).
 */
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

/** Total ring budget section. Handles in the budget modes; in Carat first, only the size's price band. */
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

/**
 * Test 2 · Stone Preferences (2a). One URL per variant: /test-2/a, /test-2/b, /test-2/c.
 *  A Size first (carats, or millimetres for gemstones) · B Budget first · C Size + Budget (BASIC concept "Shop by").
 * Styling: Figma 7685:417428. Leads to Recommendations (2b) or the Diamonds PLP.
 */
export function Test2() {
  const navigate = useNavigate()
  const { variant, prefs, sim, update, setSize, matching, href } = useStonePrefs()
  const { shopBy } = variant
  const set = SETTING.price

  // Price Explained: Carat first = that size's range; Budget first = the budget; Size + Budget = the overlap.
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
      <StoneStepLayout prefs={prefs} size={sim.size}>
        <StepIntro
          eyebrow="Step 2 of 3 · Stone"
          title="Find your Stone"
          subtitle="Tell us what you're looking for and we'll recommend stones to suit your ring and budget."
        />
        <SectionDivider />
        <StoneTypeToggle value={prefs.type} onChange={(type) => update({ type })} />
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
            { label: "Setting", desc: SETTING.name, price: formatPrice(set) },
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
          count={matching.length}
          onViewAll={() => navigate(href("diamonds", { from: "prefs" }))}
        />
      </StoneStepLayout>
    </div>
  )
}
