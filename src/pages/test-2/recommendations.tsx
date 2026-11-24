import { useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { CaretLeftIcon, XIcon } from "@phosphor-icons/react"
import { EllipsisVertical } from "lucide-react"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { MediaNote } from "@/components/pdp/media-note"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DELIVERY, SETTING } from "@/data/dyo"
import { formatSize, gemById, recommend, stoneImage, stonePhotos, stoneShape, stoneSpecs, stoneTitle, stoneType, type StonePick, type StoneTypeId } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { effectiveShape, useStonePrefs, type StoneSim } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"
import type { ShopBy } from "./variants"

/**
 * The line under the picks heading that ties them back to the shopper's choices, with the values in bold
 * (Figma 8173:188141): "Based on your preferred size of **2.25 ct** and ring budget of **$3,500 – $7,000**."
 */
function Basis({ shopBy, sim }: { shopBy: ShopBy; sim: StoneSim }) {
  const size = <span className="font-semibold">{formatSize(sim.size, sim.sizes.unit)}</span>
  const budget = <span className="font-semibold">{`${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)}`}</span>
  return (
    <p className="text-sm leading-5 font-medium text-muted-foreground">
      {shopBy === "size" ? (
        <>Based on your preferred size of {size}.</>
      ) : shopBy === "budget" ? (
        <>Based on your ring budget of {budget}.</>
      ) : !sim.inBudget ? (
        <>
          Based on your preferred size of {size}, outside your ring budget of {budget}.
        </>
      ) : (
        <>
          Based on your preferred size of {size} and ring budget of {budget}.
        </>
      )}
    </p>
  )
}

/** "Round Natural Diamonds", "Round Lab-Grown Diamonds", "Oval Rubies" */
function picksHeading(type: StoneTypeId, shape: string, gem: string) {
  const shapeName = stoneShape(shape).label
  if (type !== "gemstone") return `${shapeName} ${stoneType(type).plpLabel}`
  const name = gemById(gem).label
  return `${shapeName} ${name.endsWith("y") ? `${name.slice(0, -1)}ies` : `${name}s`}`
}

/** Carat (Size for gemstones) · Clarity · Color · Cut in one row, a divider left of each cell (Figma 8212:97435). */
function SpecStrip({ pick }: { pick: StonePick }) {
  const specs = stoneSpecs(pick.stone)
  const cells = [
    pick.stone.type === "gemstone"
      ? { label: "Size", value: `${pick.stone.size.toFixed(1)} mm` }
      : { label: "Carat", value: `${pick.stone.carat.toFixed(2)} ct` },
    { label: "Clarity", value: specs.clarity },
    { label: "Color", value: specs.color },
    { label: "Cut", value: specs.cut },
  ]
  return (
    <dl className="flex w-full">
      {cells.map((c) => (
        <div key={c.label} className="flex min-w-0 flex-1 flex-col gap-1 border-l border-border-subtle bg-background px-2.5 py-2">
          <dt className="text-xxs leading-3 font-semibold tracking-[1px] text-muted-foreground uppercase">{c.label}</dt>
          <dd className="text-xs leading-4 tracking-[0.12px] text-primary tabular-nums">{c.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** "STONE ONLY $6,015" */
function StonePrice({ price }: { price: number }) {
  return (
    <p className="flex items-baseline gap-2 whitespace-nowrap text-primary">
      <span className="text-xxs leading-3 tracking-[1px] uppercase">Stone only</span>
      <span className="text-sm leading-5 font-semibold">{formatPrice(price)}</span>
    </p>
  )
}

/**
 * Pick tile (Figma 8212:97435): photo; the pick's headline and the stone, with the radio; the 4Cs row; then View
 * details and the stone price. Selection only changes the border. Phones run the 4Cs and price under the photo.
 */
function PickTile({ pick, scope, selected, onSelect, onDetails }: { pick: StonePick; scope: string; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  const img = stoneImage(pick.stone)
  const title = pickTitle(pick, scope)
  return (
    <div
      onClick={onSelect}
      className={cn(
        "grid cursor-pointer grid-cols-[--spacing(18)_minmax(0,1fr)] items-start gap-x-4 gap-y-4 bg-background md:gap-x-5",
        selected ? "border-2 border-primary p-3.75" : "border border-border-subtle p-4 hover:border-border",
      )}
    >
      <div className="size-18 overflow-hidden bg-secondary md:row-span-3">
        {/* Gemstones without a photo: Shane Co.'s ring render, cropped in on the stone. */}
        <img
          src={img.src}
          alt=""
          className={cn("size-full", img.render ? "origin-[50%_30%] scale-[2.4] object-contain" : img.photo ? "object-cover" : "object-contain p-2.5 mix-blend-multiply")}
        />
      </div>
      <div className="flex items-start gap-4 text-primary">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm leading-5 font-semibold">{title}</p>
          <p className="text-xs leading-4 tracking-[0.12px]">{stoneTitle(pick.stone)}</p>
        </div>
        <RadioGroupItem value={pick.kind} aria-label={`${title}: ${stoneTitle(pick.stone)}`} className="border-primary" />
      </div>
      <div className="col-span-2 md:col-span-1 md:col-start-2">
        <SpecStrip pick={pick} />
      </div>
      <div className="col-span-2 flex items-baseline justify-between gap-3 text-primary md:col-span-1 md:col-start-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDetails()
          }}
          className="shrink-0 cursor-pointer type-label-xs underline"
        >
          View details
        </button>
        <StonePrice price={pick.stone.price} />
      </div>
    </div>
  )
}

/** "within your budget", or "near your preferred size" when the picks aren't held to a budget (variant A, or C over it). */
function pickScope(shopBy: ShopBy, sim: StoneSim) {
  return shopBy === "size" || !sim.inBudget ? "near your preferred size" : "within your budget"
}

/**
 * Each pick's headline, on its tile and the details overlay (Figma 8212:97435, 8224:48019).
 */
function pickTitle(pick: StonePick, scope: string) {
  if (pick.kind === "size") return `Biggest stone ${scope}`
  if (pick.kind === "value") return pick.stone.type === "gemstone" ? "Best balance of size, color and clarity" : "Best balance of size, sparkle and color"
  return "Top grades, slightly smaller size"
}

/**
 * The details overlay's headline and why-this-stone copy (Figma 8224:48019), written from the stone's own grades so
 * it stays true for every pick: "Biggest stone within your budget" / "At **2.02 carats**, this is the biggest…".
 */
function pickStory(pick: StonePick, scope: string): { title: string; body: ReactNode[] } {
  const s = pick.stone
  const gem = s.type === "gemstone"
  const specs = stoneSpecs(s)
  const grade = (v: string) => (gem ? v.toLowerCase() : v)
  const noun = gem ? gemById(s.gem).label.toLowerCase() : "diamond"
  const size = gem ? `${s.size.toFixed(1)} mm` : `${s.carat.toFixed(2)} carats`
  const b = (t: string) => <span className="font-semibold">{t}</span>
  const color = b(`${grade(specs.color)} color`)
  const clarity = b(`${grade(specs.clarity)} clarity`)
  if (pick.kind === "size")
    return {
      title: pickTitle(pick, scope),
      body: [
        <>
          At {b(size)}, this is the biggest {noun} {scope}. To get you more size, this stone has a {color} and {clarity}, grades that
          put more of your budget toward {gem ? "size" : "carat weight"}.
        </>,
        <>
          {gem ? "A" : "An"} {specs.cut} cut keeps it bright and full of {gem ? "color" : "sparkle"}, so you get a bigger look without giving up
          brilliance.
        </>,
      ],
    }
  if (pick.kind === "value")
    return {
      title: pickTitle(pick, scope),
      body: [
        <>
          At {b(formatPrice(s.price))}, this {b(gem ? `${s.size.toFixed(1)} mm` : `${s.carat.toFixed(2)} ct`)} {noun} balances size, grades and price.
          Its {color} and {clarity} {gem ? "keep it bright and clean to the eye" : "look white and clean to the eye"}, so you aren’t paying for differences
          you can’t see.
        </>,
        <>A {specs.cut} cut gives it lively {gem ? "color" : "sparkle"} at a sensible price.</>,
      ],
    }
  return {
    title: pickTitle(pick, scope),
    body: [
      <>
        This {b(gem ? `${s.size.toFixed(1)} mm` : `${s.carat.toFixed(2)} ct`)} {noun} has the finest grades we found {scope}: a {color}, {clarity} and{" "}
        {gem ? "a" : "an"} {b(`${specs.cut} cut`)}.
      </>,
      <>It’s for buyers who put {gem ? "color" : "sparkle"} and purity first, in a slightly smaller size than our biggest pick.</>,
    ],
  }
}

/**
 * Pick details overlay (Figma 8224:48019): the stone's 360° view on the left (Shane Co.'s first spin frame, with the
 * play button and a "360° view" note); on the right a headline for the pick, the stone, the 4Cs, why this stone,
 * View Full Details · certificate, then a footer with the stone price, ship date, Select and the "more" menu. On
 * desktop the details scroll inside the 920 × 460 panel and the footer stays put; phones stack the image over the
 * details and pin the footer. The page behind dims to 50% black.
 */
function PickDetails({
  pick,
  kind,
  scope,
  onOpenChange,
  onSelect,
}: {
  pick: StonePick | null
  kind: "Diamond" | "Gemstone"
  scope: string
  onOpenChange: (open: boolean) => void
  onSelect: () => void
}) {
  const notInTest = useNotInTest()
  const photos = pick ? stonePhotos(pick.stone.type, pick.stone.shape, pick.stone.gem) : null
  const fallback = pick && !photos ? stoneImage(pick.stone) : null
  const story = pick ? pickStory(pick, scope) : null
  return (
    <Dialog open={pick !== null} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 supports-backdrop-filter:backdrop-blur-none" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto bg-background text-primary outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 md:h-[min(--spacing(115),calc(100svh-2rem))] md:w-230 md:flex-row md:overflow-hidden">
          {pick && story && (
            <>
              {/* One image: the 360° view (a gemstone shape with no photo shows its ring render instead). */}
              <div className="relative aspect-square shrink-0 bg-secondary md:aspect-auto md:h-full md:w-1/2">
                {photos ? (
                  <>
                    <img src={photos.spin} alt={`360° view of the ${stoneTitle(pick.stone)}`} className="absolute inset-0 size-full object-cover" />
                    <button
                      type="button"
                      aria-label="Play 360° view"
                      onClick={() => notInTest("The 360° video")}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center"
                    >
                      <span className="flex size-14 items-center justify-center rounded-full bg-white">
                        <img src="/images/icons/play.svg" alt="" className="size-6" />
                      </span>
                    </button>
                    <MediaNote className="bottom-3 left-3">360° view</MediaNote>
                  </>
                ) : (
                  fallback && (
                    <img src={fallback.src} alt={`${stoneTitle(pick.stone)}, on the ring`} className="absolute inset-0 size-full object-contain mix-blend-multiply" />
                  )
                )}
              </div>
              <div className="flex flex-col md:min-h-0 md:w-1/2">
                <div className="flex flex-col gap-6 p-5 md:min-h-0 md:flex-1 md:overflow-y-auto md:p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <DialogPrimitive.Title className="type-h4 text-primary">{story.title}</DialogPrimitive.Title>
                      <p className="text-xs leading-4 tracking-[0.12px]">{stoneTitle(pick.stone)}</p>
                    </div>
                    <DialogPrimitive.Close aria-label="Close" className="flex size-8 shrink-0 cursor-pointer items-center justify-center text-primary">
                      <XIcon className="size-5" />
                    </DialogPrimitive.Close>
                  </div>
                  <SpecStrip pick={pick} />
                  <div className="flex flex-col gap-5 text-sm leading-5">
                    {story.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 type-label-xs">
                    <button type="button" onClick={() => notInTest("Stone details")} className="cursor-pointer type-label-xs underline">
                      View Full Details
                    </button>
                    {pick.stone.type !== "gemstone" && (
                      <>
                        <span aria-hidden>∙</span>
                        <button type="button" onClick={() => notInTest("The GIA certificate")} className="cursor-pointer type-label-xs underline">
                          GIA Certificate
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Footer: stays at the bottom of the panel (desktop) or the screen (phones) while the details scroll. */}
                <div className="sticky bottom-0 flex shrink-0 flex-col gap-5 border-t border-muted bg-background px-5 py-5 md:static md:px-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="flex items-baseline gap-2 whitespace-nowrap">
                      <span className="text-sm leading-5 font-semibold">{formatPrice(pick.stone.price)}</span>
                      <span className="text-xxs leading-3 tracking-[1px] uppercase">Stone only</span>
                    </p>
                    <p className="text-xs leading-4 tracking-[0.12px]">Order now and it ships {DELIVERY.shipBy.replace("By", "by")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={onSelect}>
                      Select this {kind}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More options" className="border-border-subtle" />}>
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => notInTest("Adding to a ring")}>Add to a ring</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notInTest("Adding to a pendant")}>Add to a pendant</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notInTest("Adding a loose stone to bag")}>Add loose stone to bag</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
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

/** Tile order (Figma 8212:97435): the biggest stone first, then the balanced pick, then top grades. */
const PICK_ORDER: StonePick["kind"][] = ["size", "value", "quality"]

/**
 * Test 2 · Recommendations (2b), Figma 8038:26505 ("Stone Recommendations"): three real stones from stock
 * (biggest stone, best balance, top grades) as selectable tiles, then the Ring Summary and CTAs.
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
          }).sort((a, b) => PICK_ORDER.indexOf(a.kind) - PICK_ORDER.indexOf(b.kind)),
    [sim],
  )
  const scope = pickScope(shopBy, sim)
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const [quickview, setQuickview] = useState<StonePick | null>(null)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const kind = prefs.type === "gemstone" ? "Gemstone" : "Diamond"

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} size={selected?.stone.size ?? sim.size} gallery="full">
        <StepIntro eyebrow="Step 2 of 3 · Stone" title="Stone Recommendations" />
        <SectionDivider />
        {/* Figma 8173:187709: Edit preferences, then what the picks are ("Round Natural Diamonds"), over the tiles. */}
        <div className="flex flex-col gap-4.5">
          <button
            type="button"
            onClick={() => navigate(href("preferences"))}
            className="flex h-6 cursor-pointer items-center gap-0.5 self-start type-label-xs text-primary underline"
          >
            <CaretLeftIcon className="size-4" />
            Edit preferences
          </button>
          <div className="flex flex-col gap-2">
            <h2 className="type-h4 text-primary">{picksHeading(prefs.type, effectiveShape(prefs), prefs.gem)}</h2>
            <Basis shopBy={shopBy} sim={sim} />
          </div>
        </div>
        {selected ? (
          <>
            <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-2">
              {picks.map((p) => (
                <PickTile key={p.kind} pick={p} scope={scope} selected={p.kind === selected.kind} onSelect={() => setSelectedKind(p.kind)} onDetails={() => setQuickview(p)} />
              ))}
            </RadioGroup>
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
      {/* Pick details (Figma 8224:48019). Selecting there picks the stone and moves on, as the page's Select button
          does; the full details page is Test 3. */}
      <PickDetails
        pick={quickview}
        kind={kind}
        scope={scope}
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={() => {
          if (quickview) setSelectedKind(quickview.kind)
          setQuickview(null)
          notInTest("Finishing touches (step 3)")
        }}
      />
    </div>
  )
}
