import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { CaretLeftIcon, CheckIcon, TriangleIcon } from "@phosphor-icons/react"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { PriceExplained } from "@/components/stones/preference-parts"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SETTING } from "@/data/dyo"
import { formatSize, gemById, recommend, stoneImage, stoneShape, stoneSpecs, stoneTitle, stoneType, type SpecKey, type StonePick } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useStonePrefs, type StonePrefs, type StoneSim } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"
import type { ShopBy } from "./variants"

/** The line under the title that ties the picks back to the shopper's choices (comprehension test). */
function basis(shopBy: ShopBy, p: StonePrefs, sim: StoneSim) {
  const what = p.type === "gemstone" ? `${gemById(p.gem).label.toLowerCase()} gemstones` : stoneType(p.type).plural
  const lead = `Three ${what} in ${stoneShape(sim.scope.shape).label.toLowerCase()}, chosen for each kind of buyer.`
  const size = formatSize(sim.size, sim.sizes.unit)
  const budget = `${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)}`
  if (shopBy === "size") return `${lead} Based on your size: ${size}.`
  if (shopBy === "budget") return `${lead} Based on your ring budget: ${budget}.`
  return `${lead} Based on ${size} and a ring budget of ${budget}.`
}

/** Carat (or Size for gemstones) · Clarity · Color · Cut, with the cells this pick optimises highlighted (concept "strip"). */
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
    <dl className="grid grid-cols-4 border border-input">
      {cells.map((c, i) => {
        const on = pick.highlight.includes(c.key)
        return (
          <div
            key={c.key}
            className={cn(
              "flex min-w-0 flex-col px-2 py-1.25",
              i > 0 && "border-l border-input",
              on ? "bg-secondary shadow-[inset_0_-2px_0_var(--primary)]" : "bg-background",
            )}
          >
            <dt className="text-xxs leading-4 font-semibold tracking-[1px] text-muted-foreground uppercase">{c.label}</dt>
            <dd className={cn("text-xs leading-4 text-primary [overflow-wrap:anywhere] tabular-nums", on && "font-semibold")}>{c.value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

/** Budget check under the price: Carat first shows the ring total instead (no budget set). */
function PriceStatus({ pick, shopBy, stoneMax }: { pick: StonePick; shopBy: ShopBy; stoneMax: number }) {
  if (shopBy === "size") return <span className="text-xxs leading-4 text-muted-foreground">Ring total {formatPrice(SETTING.price + pick.stone.price)}</span>
  const over = pick.stone.price - stoneMax
  return over > 0 ? (
    <span className="flex items-center justify-end gap-1 text-xxs leading-4 text-warning">
      <TriangleIcon weight="fill" className="size-2.5" />
      {formatPrice(over)} over budget
    </span>
  ) : (
    <span className="flex items-center justify-end gap-1 text-xxs leading-4 text-success">
      <CheckIcon weight="bold" className="size-3" />
      Within budget
    </span>
  )
}

function PickTile({ pick, selected, onSelect, shopBy, stoneMax }: { pick: StonePick; selected: boolean; onSelect: () => void; shopBy: ShopBy; stoneMax: number }) {
  const img = stoneImage(pick.stone)
  return (
    <div
      onClick={onSelect}
      className={cn(
        "grid cursor-pointer grid-cols-[16px_56px_minmax(0,1fr)] items-start gap-3 bg-background",
        selected ? "border-2 border-primary px-3.25 py-2.75" : "border border-input px-3.5 py-3 hover:border-border",
      )}
    >
      <RadioGroupItem value={pick.kind} aria-label={`${pick.label}: ${stoneTitle(pick.stone)}`} className="mt-0.5 border-primary" />
      <div className="size-14 overflow-hidden bg-secondary">
        {/* Gemstones: Shane Co.'s ring render, cropped in on the stone. */}
        <img
          src={img.src}
          alt=""
          className={cn("size-full", img.render ? "origin-[50%_30%] scale-[2.4] object-contain" : img.photo ? "object-cover" : "object-contain p-2.5 mix-blend-multiply")}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="type-label-xs text-primary">{pick.label}</span>
          <span className="text-xxs leading-4 text-muted-foreground">{pick.who}</span>
        </p>
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 font-heading text-lg leading-6 font-medium text-primary lining-nums">{stoneTitle(pick.stone)}</p>
          <p className="flex shrink-0 flex-col items-end text-right">
            <span className="font-heading text-lg leading-6 font-medium text-primary lining-nums">{formatPrice(pick.stone.price)}</span>
            <PriceStatus pick={pick} shopBy={shopBy} stoneMax={stoneMax} />
          </p>
        </div>
        <SpecStrip pick={pick} />
        <p className="text-xs leading-4 text-muted-foreground">
          <span className="font-semibold text-primary">Optimized for {pick.optimizedFor}.</span> {pick.why}
        </p>
      </div>
    </div>
  )
}

/**
 * Test 2 · Recommendations (2b). Behaviour: BASIC concept "Our three picks for you";
 * tile styling from our Pattern Library tokens (Figma 7685:416729 for the page frame).
 * Three real stones from stock: Best Value, Largest Size, Finest Quality.
 */
export function Test2Recommendations() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const { variant, prefs, sim, matching, href } = useStonePrefs()
  const { shopBy } = variant
  const picks = useMemo(
    () => (sim.blocked ? [] : recommend({ scope: sim.scope, mode: shopBy, size: sim.size, stoneMin: sim.stoneMin, stoneMax: sim.stoneMax })),
    [sim, shopBy],
  )
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const kind = prefs.type === "gemstone" ? "Gemstone" : "Diamond"

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} size={selected?.stone.size ?? sim.size} gallery="full">
        <header className="flex flex-col gap-8 max-lg:gap-4">
          <StepIntro eyebrow="Step 2 of 3 · Recommended Stones" title="Our three picks for you" subtitle={basis(shopBy, prefs, sim)} />
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
            <div className="flex flex-col gap-2">
              <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones">
                {picks.map((p) => (
                  <PickTile key={p.kind} pick={p} selected={p.kind === selected.kind} onSelect={() => setSelectedKind(p.kind)} shopBy={shopBy} stoneMax={sim.stoneMax} />
                ))}
              </RadioGroup>
              <p className="text-xxs leading-4 text-muted-foreground">Highlighted cells are what each pick optimizes.</p>
            </div>
            <PriceExplained
              rows={[
                { label: "Setting", desc: `${SETTING.name} · ${SETTING.metal.replace("14K", "14k")}`, price: formatPrice(SETTING.price) },
                {
                  label: `Center ${kind}`,
                  desc: (
                    <>
                      {stoneTitle(selected.stone)} · <span className="font-semibold">{selected.label.toLowerCase()}</span>
                    </>
                  ),
                  price: formatPrice(selected.stone.price),
                },
              ]}
              total={formatPrice(SETTING.price + selected.stone.price)}
            />
          </>
        ) : (
          <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
            <p className="type-h5 text-primary">No stones match these preferences</p>
            <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
          </div>
        )}
        <StoneCtas
          primary={stoneType(prefs.type).cta}
          onPrimary={() => notInTest("Finishing touches (step 3)")}
          primaryDisabled={!selected}
          viewAllDisabled={sim.blocked}
          shape={prefs.shape}
          count={matching.length}
          onViewAll={() => navigate(href("diamonds", { from: "recs" }))}
        />
      </StoneStepLayout>
    </div>
  )
}
