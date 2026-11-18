import { useNavigate } from "react-router"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import {
  ConfigHeader,
  MiniRange,
  ResultPanel,
  ShapeSelector,
  SimSlider,
  StoneTypeToggle,
} from "@/components/stones/preference-parts"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { SETTING } from "@/data/dyo"
import {
  CARAT,
  availableCarats,
  caratRangeForBudget,
  ringRangeForWindow,
  sizeInBudget,
  stoneShape,
  stoneType,
} from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { rangeMiddle, snapCarat, useStonePrefs, type StonePrefs } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"

const ct = (c: number) => `${c.toFixed(2)} ct`
const range = (a: number, b: number) => `${formatPrice(a)} – ${formatPrice(b)}`
const CARAT_SCALE = { from: ct(CARAT.min), to: ct(CARAT.max) }

type Update = (patch: Partial<StonePrefs>) => void

/** "$1,500 … $25,000+": the top of a budget scale means "and above". */
function budgetLabel(value: number, max: number) {
  return value >= max ? `${formatPrice(max)}+` : formatPrice(value)
}

function settingRow() {
  return { label: `Setting · ${SETTING.metal.replace("14K", "14k")}`, value: formatPrice(SETTING.price) }
}

/** Variant A: carat range (two independent handles) → whole-ring price range for that range. */
function SizeControls({ prefs, update }: { prefs: StonePrefs; update: Update }) {
  const { type, shape, caratLo: lo, caratHi: hi } = prefs
  const { ringMin, ringMax, stoneMin, stoneMax } = ringRangeForWindow(type, shape, lo, hi)
  const budget = stoneType(type).budget

  // Each handle moves on its own: the shopper widens or narrows the range (opens at ±0.25 ct around 1 ct).
  const onRange = ([a, b]: number[]) => update({ caratLo: snapCarat(Math.min(a, b)), caratHi: snapCarat(Math.max(a, b)) })

  return (
    <>
      <section className="flex flex-col gap-6">
        <ConfigHeader title="Select your carat size" value={`${lo.toFixed(2)} – ${ct(hi)}`} />
        <SimSlider
          label="Carat size"
          min={CARAT.min}
          max={CARAT.max}
          step={0.05}
          value={[lo, hi]}
          onChange={onRange}
          minStepsBetweenValues={1}
          scale={CARAT_SCALE}
        />
      </section>
      <ResultPanel
        eyebrow="Estimated total ring price"
        value={range(ringMin, ringMax)}
        bar={
          <MiniRange
            from={ringMin}
            to={ringMax}
            min={budget.min}
            max={budget.max}
            scale={{ from: formatPrice(budget.min), to: budgetLabel(budget.max, budget.max) }}
          />
        }
        rows={[
          settingRow(),
          { label: `Center stone · ${ct(lo)} – ${ct(hi)} ${stoneType(type).short}`, value: range(stoneMin, stoneMax) },
        ]}
        note="Color and clarity set where you land in this range. You choose the exact stone next."
      />
    </>
  )
}

/** Variant B: total ring budget → the stone sizes it buys (capped per stone type). */
function BudgetControls({ prefs, update }: { prefs: StonePrefs; update: Update }) {
  const { type, shape, budgetHi } = prefs
  const budget = stoneType(type).budget
  const result = caratRangeForBudget(type, shape, budgetHi)

  return (
    <>
      <section className="flex flex-col gap-6">
        <ConfigHeader title="Total ring budget" value={`Up to ${budgetLabel(budgetHi, budget.max)}`} />
        <SimSlider
          label="Total ring budget"
          min={budget.min}
          max={budget.max}
          step={250}
          value={[budgetHi]}
          onChange={([v]) => update({ budgetHi: v })}
          scale={{ from: formatPrice(budget.min), to: budgetLabel(budget.max, budget.max) }}
        />
      </section>
      {result.empty ? (
        <ResultPanel
          eyebrow="Carat range based on budget"
          value="No stones at this budget"
          note={`Less your setting (${formatPrice(SETTING.price)}), that leaves ${formatPrice(Math.max(0, result.stoneBudget))} for the stone. Raise your budget to see ${stoneShape(shape).label.toLowerCase()} stones.`}
        />
      ) : (
        <ResultPanel
          eyebrow="Carat range based on budget"
          value={`${(result.topQuality ?? CARAT.min).toFixed(2)} – ${ct(result.lowQuality)}`}
          bar={<MiniRange from={result.topQuality ?? CARAT.min} to={result.lowQuality} min={CARAT.min} max={CARAT.max} scale={CARAT_SCALE} />}
          rows={[
            { label: "Highest quality", value: result.topQuality ? ct(result.topQuality) : "Above budget" },
            { label: "Lowest quality", value: ct(result.lowQuality) },
          ]}
          note={`Less your setting (${formatPrice(SETTING.price)}), that leaves up to ${formatPrice(result.stoneBudget)} for the stone. We also show stones that run a little over.`}
        />
      )}
    </>
  )
}

/** Variant C: budget handles set the available sizes; the carat handle picks one within them. */
function SizeAndBudgetControls({ prefs, update }: { prefs: StonePrefs; update: Update }) {
  const { type, shape, carat, budgetLo, budgetHi } = prefs
  const budget = stoneType(type).budget
  const available = availableCarats(type, shape, budgetLo, budgetHi)
  const size = sizeInBudget(type, shape, carat, budgetLo, budgetHi)

  const keepInside = (c: number, a: typeof available) => (a ? snapCarat(c, Math.ceil(a.from * 20) / 20, Math.floor(a.to * 20) / 20) : c)

  const onBudget = ([lo, hi]: number[]) => {
    const next = availableCarats(type, shape, lo, hi)
    update({ budgetLo: lo, budgetHi: hi, carat: keepInside(carat, next) })
  }

  let note: string
  if (!available) note = `Nothing fits between ${range(budgetLo, budgetHi)} yet. Widen your budget to see sizes.`
  else if (!size.inBudget)
    note =
      size.ringMin > budgetHi
        ? `The lowest grades at ${ct(carat)} start at ${formatPrice(size.ringMin)}. Choose a smaller size or raise your budget.`
        : `Even the top grades at ${ct(carat)} come in under ${formatPrice(budgetLo)}. Choose a larger size or lower your budget.`
  else if (size.ringMax > budgetHi)
    note = size.topFitsCarat
      ? `Top quality at ${ct(carat)} is ${formatPrice(size.ringMax)}. Drop to ${ct(size.topFitsCarat)} to get it within your budget, or raise your budget.`
      : `Top quality at ${ct(carat)} is ${formatPrice(size.ringMax)}. Raise your budget to reach it.`
  else note = `Every grade at ${ct(carat)} fits your budget, up to top quality at ${formatPrice(size.ringMax)}.`

  return (
    <>
      <section className="flex flex-col gap-6">
        <ConfigHeader title="Total ring budget" value={`${formatPrice(budgetLo)} – ${budgetLabel(budgetHi, budget.max)}`} />
        <SimSlider
          label="Total ring budget"
          min={budget.min}
          max={budget.max}
          step={250}
          value={[budgetLo, budgetHi]}
          onChange={onBudget}
          scale={{ from: formatPrice(budget.min), to: budgetLabel(budget.max, budget.max) }}
        />
      </section>
      <section className="flex flex-col gap-6">
        <ConfigHeader title="Select your carat size" value={ct(carat)} />
        <SimSlider
          label="Carat size"
          min={CARAT.min}
          max={CARAT.max}
          step={0.05}
          value={[carat]}
          onChange={([c]) => update({ carat: keepInside(c, available) })}
          band={available}
          scale={CARAT_SCALE}
        />
      </section>
      <ResultPanel
        eyebrow={`Price for ${ct(carat)} in your budget`}
        value={size.inBudget ? range(size.inBudget.lo, size.inBudget.hi) : "Outside your budget"}
        bar={
          <MiniRange
            from={size.inBudget?.lo ?? size.ringMin}
            to={size.inBudget?.hi ?? size.ringMin}
            min={size.ringMin}
            max={size.ringMax}
            scale={{ from: formatPrice(size.ringMin), to: formatPrice(size.ringMax) }}
          />
        }
        rows={[
          settingRow(),
          {
            label: `Center stone · ${ct(carat)} ${stoneType(type).short}`,
            value: size.inBudget ? range(size.inBudget.lo - SETTING.price, size.inBudget.hi - SETTING.price) : "–",
          },
        ]}
        note={note}
      />
    </>
  )
}

/**
 * Test 2 · Stone Preferences (2a). One URL per variant: /test-2/a, /test-2/b, /test-2/c (old ?variant= links still work).
 * Figma: A 7685:412966, B 7685:414388, C 7685:415174. Leads to Recommendations (2b) or the Diamonds PLP.
 */
export function Test2() {
  const navigate = useNavigate()
  const { variant, prefs, update, matching, href } = useStonePrefs()

  // Changing type or shape keeps the size/budget; C re-fits its size inside the new availability.
  const reshape = (patch: Partial<StonePrefs>) => {
    if (variant.id !== "C") return update(patch)
    const next = { ...prefs, ...patch }
    const a = availableCarats(next.type, next.shape, next.budgetLo, next.budgetHi)
    update(a ? { ...patch, carat: snapCarat(next.carat, Math.ceil(a.from * 20) / 20, Math.floor(a.to * 20) / 20) } : patch)
  }

  // B has no chosen size: preview the largest stone the budget buys at the lowest grades.
  // The ring preview shows one stone: the middle of A's range, the middle of the sizes B's budget buys
  // (top grades → lowest grades), and C's chosen size.
  const b = variant.id === "B" ? caratRangeForBudget(prefs.type, prefs.shape, prefs.budgetHi) : null
  const previewCarat = b && !b.empty ? rangeMiddle(b.topQuality ?? CARAT.min, b.lowQuality) : prefs.carat
  const showsRange = variant.id === "A" || (b !== null && !b.empty)

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout
        prefs={prefs}
        carat={previewCarat}
        previewNote={showsRange ? "middle of your range" : undefined}
      >
        <StepIntro
          eyebrow="Step 2 of 3 · Stone"
          title="Find your Stone"
          subtitle="Tell us what you're looking for and we'll recommend stones to suit your ring and budget."
        />
        <SectionDivider />
        <StoneTypeToggle value={prefs.type} onChange={(type) => reshape({ type })} />
        <ShapeSelector value={prefs.shape} onChange={(shape) => reshape({ shape })} />
        <SectionDivider />
        {variant.controls === "size" && <SizeControls prefs={prefs} update={update} />}
        {variant.controls === "budget" && <BudgetControls prefs={prefs} update={update} />}
        {variant.controls === "size-and-budget" && <SizeAndBudgetControls prefs={prefs} update={update} />}
        <StoneCtas
          primary="View Recommended Stones"
          onPrimary={() => navigate(href("recommendations"))}
          primaryDisabled={matching.length === 0}
          shape={prefs.shape}
          count={matching.length}
          onViewAll={() => navigate(href("diamonds", { from: "prefs" }))}
        />
      </StoneStepLayout>
    </div>
  )
}
