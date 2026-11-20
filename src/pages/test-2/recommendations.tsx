import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SETTING } from "@/data/dyo"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { formatSize, recommend, stoneImage, stoneSpecs, stoneTitle, toQuickviewDiamond, type SpecKey, type StonePick } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useStonePrefs, type StoneSim } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"
import type { ShopBy } from "./variants"

/** The line under the title that ties the picks back to the shopper's choices (Figma 8038:26505). */
function basis(shopBy: ShopBy, sim: StoneSim, count: number) {
  const size = formatSize(sim.size, sim.sizes.unit)
  const budget = `${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)}`
  // Real stock can leave fewer than three stones that fit (a small size in a high budget, a rare shape).
  const lead = count === 1 ? "Our stone pick for you." : `Our ${count === 2 ? "two" : "three"} stone picks for you.`
  if (shopBy === "size") return `${lead} Based on your preferred size of ${size}.`
  if (shopBy === "budget") return `${lead} Based on your ring budget of ${budget}.`
  if (!sim.inBudget) return `${lead} Based on your preferred size of ${size}, outside your ring budget of ${budget}.`
  return `${lead} Based on your preferred size of ${size} and ring budget of ${budget}.`
}

/** Carat (Size for gemstones) · Clarity · Color · Cut; the cells this pick optimises are shaded and bold. */
function SpecStrip({ pick }: { pick: StonePick }) {
  const specs = stoneSpecs(pick.stone)
  const cells: { key: SpecKey; label: string; value: string }[] = [
    pick.stone.type === "gemstone"
      ? {
          key: "size",
          label: "Size",
          value: `${pick.stone.size.toFixed(1)} mm`,
        }
      : {
          key: "size",
          label: "Carat",
          value: `${pick.stone.carat.toFixed(2)} ct`,
        },
    { key: "clarity", label: "Clarity", value: specs.clarity },
    { key: "color", label: "Color", value: specs.color },
    { key: "cut", label: "Cut", value: specs.cut },
  ]
  return (
    // 1px gaps over the input colour draw the dividers, so the cells can sit 4 across or 2 × 2 on phones.
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

/**
 * Pick tile (Figma 8038:26505, the first tile sets the style for all three): badge, radio, stone, one-line
 * summary, stone price and ring total, the 4Cs strip and what it's optimized for. Selection only changes the border.
 */
function PickTile({ pick, selected, onSelect, onDetails }: { pick: StonePick; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  const img = stoneImage(pick.stone)
  const ringTotal = `Ring Total: ${formatPrice(SETTING.price + pick.stone.price)}`
  return (
    <div
      onClick={onSelect}
      className={cn("flex cursor-pointer items-start gap-3 bg-background md:gap-5", selected ? "border-2 border-primary p-3.75" : "border border-border-subtle p-4 hover:border-border")}
    >
      <div className="size-13.5 shrink-0 overflow-hidden bg-secondary">
        {/* Gemstones: Shane Co.'s ring render, cropped in on the stone. */}
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
          {/* Phones: price and ring total move under the title, side by side. */}
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
            onDetails()
          }}
          className="cursor-pointer self-start type-label-xs text-primary underline"
        >
          View details
        </button>
      </div>
    </div>
  )
}

/** Ring Summary (Figma 8038:26505): setting and stone lines, divider, ring total. */
function RingSummaryBox({ stone }: { stone: StonePick["stone"] }) {
  const rows = [
    {
      label: `Setting: ${SETTING.name.replace(/ Engagement Ring$/, "")}, ${SETTING.metal.replace("14K", "14k")}`,
      price: SETTING.price,
    },
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
        <span className="whitespace-nowrap">{formatPrice(SETTING.price + stone.price)}</span>
      </div>
    </div>
  )
}

/**
 * Test 2 · Recommendations (2b), Figma 8038:26505 ("Stone Recommendations"): three real stones from stock
 * (Best Value, Largest Size, Finest Quality) as selectable tiles, then the Ring Summary and CTAs.
 */
export function Test2Recommendations() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const { variant, prefs, sim, matching, href } = useStonePrefs()
  const { shopBy } = variant
  const picks = useMemo(
    () =>
      sim.blocked
        ? []
        : recommend({
            scope: sim.scope,
            mode: sim.pickMode,
            size: sim.size,
            stoneMin: sim.stoneMin,
            stoneMax: sim.stoneMax,
          }),
    [sim],
  )
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const [quickview, setQuickview] = useState<StonePick | null>(null)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const kind = prefs.type === "gemstone" ? "Gemstone" : "Diamond"

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} size={selected?.stone.size ?? sim.size} gallery="full">
        <header className="flex flex-col gap-8 max-lg:gap-4">
          <StepIntro eyebrow="Step 2 of 3 · Stone" title="Stone Recommendations" subtitle={basis(shopBy, sim, picks.length)} />
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
                <PickTile key={p.kind} pick={p} selected={p.kind === selected.kind} onSelect={() => setSelectedKind(p.kind)} onDetails={() => setQuickview(p)} />
              ))}
            </RadioGroup>
            <SectionDivider />
            <RingSummaryBox stone={selected.stone} />
          </>
        ) : (
          <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
            <p className="type-h5 text-primary">No stones match these preferences</p>
            <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
          </div>
        )}
        <StoneCtas
          primary={`Select This ${kind}`}
          onPrimary={() => notInTest("Finishing touches (step 3)")}
          primaryDisabled={!selected}
          viewAllDisabled={sim.blocked}
          shape={prefs.shape}
          count={matching.length}
          onViewAll={() => navigate(href("diamonds", { from: "recs" }))}
        />
      </StoneStepLayout>
      {/* The Diamond GLP's Quickview, for diamonds and gemstones (ring total = this setting + the stone). Selecting
          there picks the stone and moves on, as the page's Select button does; the full details page is Test 3. */}
      <DiamondQuickview
        diamond={quickview && toQuickviewDiamond(quickview.stone)}
        title={quickview ? stoneTitle(quickview.stone) : undefined}
        noun={kind}
        certificate={prefs.type === "gemstone" ? null : undefined}
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={() => {
          if (quickview) setSelectedKind(quickview.kind)
          setQuickview(null)
          notInTest("Finishing touches (step 3)")
        }}
        onViewDetails={() => notInTest("Stone details")}
      />
    </div>
  )
}
