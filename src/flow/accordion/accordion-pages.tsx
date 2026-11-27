import { useMemo, useRef, useState, type ReactNode } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import { ChatCircleIcon, EnvelopeSimpleIcon, HeartStraightIcon } from "@phosphor-icons/react"
import { Assurances, DeliveryOptions as DyoDeliveryOptions } from "@/components/dyo/buy-actions"
import {
  PersonalizeSection,
  RingSizeSection,
  WeddingBandSection,
  useFinishingOverlays,
} from "@/components/dyo/finishing-sections"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { DyoAssurances, MetalSelector } from "@/components/pdp/setting-buy-form"
import { SettingGallery } from "@/components/pdp/setting-gallery"
import { StonePreviewMenu } from "@/components/pdp/stone-preview-menu"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { ShapeSelector, StoneTypeToggle } from "@/components/stones/preference-parts"
import { Button } from "@/components/ui/button"
import { CLASSIC_CROWN, ENGRAVING, type GalleryImage } from "@/data/dyo"
import { SHAPES } from "@/data/plp"
import { flowMetalFor, flowSettingFor } from "@/data/flow-settings"
import { galleryFor } from "@/data/products"
import { formatSize, shapesFor, stoneShape, stoneTitle, stoneType, toQuickviewDiamond, type StonePick } from "@/data/stones"
import { useFlow } from "@/flow/flow-context"
import { FLOW_CRUMBS, FLOW_ROUTES } from "@/flow/flow-paths"
import { useFlowRingGallery } from "@/flow/ring-images"
import { FlowStoneGallery } from "@/flow/stone/flow-stone-gallery"
import { BudgetSection, SizeSection, stoneName } from "@/flow/stone/preferences-page"
import { Basis, picksHeading } from "@/flow/stone/recommendations-page"
import { firstStoneQuery, flowStonePath, effectiveShape, useFlowStonePrefs } from "@/flow/stone/simulator"
import { useFlowSelectDiamond } from "@/flow/stone/use-flow-stone"
import { settingTaskEnd, useFlowStoneTypes, useStudyAddToBag, useStudyViewAll } from "@/flow/study/study"
import { formatPrice } from "@/lib/format"
import { useElementHeight } from "@/lib/hooks"
import { cn, PAGE_MAX } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"
import { BuildPanel, type PriceLine } from "./build-panel"
import { InlineRecommendations } from "./inline-recommendations"
import { RecommendationsSheet } from "./recommendations-sheet"

/*
 * Accordion steps flow (/flow-accordion) · the pages. A separate moderated flow test (Lucid "Shane Co DYO Full
 * Flow and Steps Interface" › "Alternate UX – Accordion steps (Continuous PDP-style)"): every step keeps the
 * PDP layout (gallery left, "Design Your Ring" panel right) instead of the 1/2/3 bar. Wireframes only, so it is
 * built from the existing components and tokens; the logic is the /flow pages' (Ella Cathedral, Test 2's stock,
 * Test 4's finishing touches). /flow and the unmoderated tests are untouched.
 */

const COLUMNS = "grid lg:grid-cols-[826fr_606fr] lg:gap-2"

/** Header, the product breadcrumb, then gallery and panel side by side (stacked on phones), footer, mobile bar. */
function AccordionFrame({ gallery, panel, galleryFull = true }: { gallery: ReactNode; panel: ReactNode; galleryFull?: boolean }) {
  const flow = useFlow()
  const { settingId } = useRingBuild()
  const panelRef = useRef<HTMLDivElement>(null)
  const panelHeight = useElementHeight(panelRef)
  // No jump to the top here: the panel scrolls the page to the current step (BuildPanel).
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader contained navigation />
      <main className={PAGE_MAX}>
        {flow?.config.crumbs && (
          <div className={COLUMNS}>
            <Breadcrumb items={FLOW_CRUMBS.setting(settingId)} className="mx-2 bg-secondary" />
          </div>
        )}
        <div className={COLUMNS}>
          {/* A single preview image stays in view while the panel scrolls; long galleries scroll beside a sticky panel. */}
          <div className={cn(!galleryFull && "transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset) lg:self-start lg:pb-8")}>{gallery}</div>
          <aside className="px-margin pt-8 pb-12 lg:px-14 lg:pt-5">
            {/* As the setting PDP's long-scroll buy form: when the panel is taller than the screen it scrolls with the
                page until its bottom is in view, then sticks there while the gallery carries on scrolling. */}
            <div
              ref={panelRef}
              className={cn(galleryFull && "transition-[top] duration-300 ease-out lg:sticky")}
              style={
                galleryFull
                  ? { top: `min(calc(var(--header-offset) + var(--spacing) * 5), calc(100vh - ${panelHeight}px - var(--spacing) * 8))` }
                  : undefined
              }
            >
              {panel}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter contained />
      <MobileBottomNav />
    </div>
  )
}

/** "Chat with a jewelry consultant" under the panel, centred (Figma 7549:394197). */
function ChatLink() {
  const notInTest = useNotInTest()
  return (
    <Button variant="link" className="h-auto gap-2 self-center px-0 py-2" onClick={() => notInTest("Chat")}>
      <ChatCircleIcon /> Chat with a jewelry consultant
    </Button>
  )
}

function useGo() {
  const flow = useFlow()
  const navigate = useNavigate()
  return (to: string) => {
    navigate(flow ? flow.path(to) : to)
    window.scrollTo({ top: 0 })
  }
}

/* ───────────── Step 1 · Setting ───────────── */

/**
 * Setting step (Figma 7541:336267, "Setting open"): the long gallery on the left; in the panel the step holds
 * the metal and "Continue to Stone" (Continue to Finishing Touches once the journey is stone-first).
 */
export function AccordionSetting() {
  const flow = useFlow()
  const go = useGo()
  const { settingId, settingMetal, setSettingMetal, shape, setting: built, stone, start, setSettingChosen } = useRingBuild()
  // Stone-first (setting removed with a stone already picked): the stone is done, so the setting leads to step 3.
  const stoneFirst = start === "stone"
  const setting = flowSettingFor(settingId)
  const metal = flowMetalFor(setting, settingMetal)
  const [previewShape, setPreviewShape] = useState(shape && setting.shapes.includes(shape) ? shape : setting.shapes[0])
  const { carat } = setting.previewStone
  const shapeLabel = SHAPES.find((s) => s.id === previewShape)?.label ?? setting.previewStone.shape
  const media = galleryFor(setting, metal, previewShape)
  const total = formatPrice(built.price + (stoneFirst ? stone.price : 0))
  // Full-flow study: the stone shape preview is a "Preview a Stone Shape" selector in the panel (as Test 1 G), every
  // shape the setting takes, instead of the gallery's dropdown. On phones a pick glides back up to the new preview.
  const shapeInForm = flow?.study != null
  const previewShapeInForm = (next: string) => {
    if (next === previewShape) return
    setPreviewShape(next)
    if (window.matchMedia("(min-width: 64rem)").matches) return
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })))
  }

  const next = () => {
    // Study part 1 ends here: the accordion's "Continue to Stone" is its "Select this Setting".
    if (flow?.study) return flow.study.endTask(settingTaskEnd(setting, metal))
    setSettingChosen(true)
    if (stoneFirst) go("/finish")
    else go(flowStonePath("preferences", firstStoneQuery(flow?.config.t2 ?? "B", previewShape, built.price)))
  }

  return (
    <AccordionFrame
      gallery={
        <SettingGallery
          key={metal}
          media={media}
          previewLabel={`Previewing: ${shapeLabel} ∙ ${carat.toFixed(2)} ct`}
          // The full-flow study previews the shape in the panel instead (below the metal).
          previewMenu={
            shapeInForm ? undefined : (
              <StonePreviewMenu shapes={setting.shapes} value={previewShape} onChange={setPreviewShape} mobileDetail={`${carat.toFixed(2)} ct`} />
            )
          }
          previewShape={previewShape}
        />
      }
      panel={
        <div className="flex flex-col gap-6">
          <BuildPanel
            current="setting"
            ringTotal={total}
            lines={[
              { label: "Setting", desc: setting.name, value: formatPrice(built.price) },
              stoneFirst ? { label: "Stone", desc: stone.title, value: formatPrice(stone.price) } : { label: "Stone", desc: "Select your stone" },
            ]}
            total={total}
          >
            <MetalSelector compact options={setting.variants.map((v) => ({ metal: v.metal, price: v.price }))} value={metal} onChange={setSettingMetal} />
            {shapeInForm && <ShapeSelector title="Preview a Stone Shape" shapes={setting.shapes} value={previewShape} onChange={previewShapeInForm} />}
            <Button className="w-full" onClick={next}>
              {stoneFirst ? "Continue to Finishing Touches" : "Continue to Stone"}
            </Button>
          </BuildPanel>
          <SaveAndHint />
          <DyoAssurances />
          <ChatLink />
        </div>
      }
    />
  )
}

/** Save and Drop a Hint under the price box (Figma 7541:336272). */
function SaveAndHint() {
  const notInTest = useNotInTest()
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1" onClick={() => notInTest("Saving")}>
        <HeartStraightIcon /> Save
      </Button>
      <Button variant="outline" className="flex-1" onClick={() => notInTest("Drop a hint")}>
        <EnvelopeSimpleIcon /> Drop a Hint
      </Button>
    </div>
  )
}

/* ───────────── Step 2 · Stone ───────────── */

/** Tile order (Figma 7541:363764): the biggest stone first, then Our Pick, then top grades. */
const PICK_ORDER: StonePick["kind"][] = ["size", "value", "quality"]

/**
 * Stone step (Figma 7541:341906, "Stone open (Stone Finder)"): the preferences in the panel; "View Recommended
 * Stones" opens the recommendations in a modal (7541:353247). The recommendations URL is this page with the
 * modal open, so Back and the stepper's Edit keep working. Both routes render this same component, so moving
 * between them keeps the page mounted and the modal slides in and out over it.
 */
export function AccordionStone() {
  const flow = useFlow()
  const navigate = useNavigate()
  const recommendations = useLocation().pathname.endsWith("/recommendations")
  const selectDiamond = useFlowSelectDiamond()
  const { variant, prefs, sim, update, setSize, matching, prices, picks: flowPicks, matchedBy, href, setting } = useFlowStonePrefs()
  const viewAll = useStudyViewAll()
  const stoneTypes = useFlowStoneTypes()
  const { shopBy } = variant
  const set = setting.price
  const r5 = (n: number) => Math.round(n / 5) * 5
  const range = (a: number, b: number) => `${formatPrice(r5(a))} - ${formatPrice(r5(b))}`
  // Same numbers as the /flow preferences page's Price Explained: the matching stones, so the sum adds up.
  const stonePrice = prices ? range(prices.stone.lo, prices.stone.hi) : "—"
  const total = prices ? range(prices.ring.lo, prices.ring.hi) : "—"
  const size = <SizeSection sim={sim} setSize={setSize} shopBy={shopBy} />
  const budget = <BudgetSection sim={sim} update={update} interactive={shopBy !== "size"} withBand={shopBy === "size"} />
  const shapeLabel = stoneShape(effectiveShape(prefs)).label

  // Matched as View All is (size and budget together where they meet: simulator matchMode).
  const picks = useMemo(() => [...flowPicks].sort((a, b) => PICK_ORDER.indexOf(a.kind) - PICK_ORDER.indexOf(b.kind)), [flowPicks])
  // "Natural · Round · 1.00 ct · Up to $7,000": what the picks were matched on (the size alone in Carat first).
  const basis = [
    stoneType(prefs.type).label,
    shapeLabel,
    ...(matchedBy !== "budget" ? [formatSize(sim.size, sim.sizes.unit)] : []),
    ...(matchedBy !== "size" ? [`Up to ${formatPrice(sim.budgetHi)}`] : []),
  ].join(" · ")

  // The full-flow study shows the recommendations in the stone step itself, as stacked tiles (the step-by-step
  // flow's page, Test 2's tiles) rather than in the drawer. The first pick starts selected, as on that page.
  const inline = flow?.study != null
  const [chosenKind, setChosenKind] = useState<StonePick["kind"] | null>(null)
  const [wasRecs, setWasRecs] = useState(recommendations)
  if (wasRecs !== recommendations) {
    setWasRecs(recommendations)
    if (recommendations) setChosenKind(null)
  }
  const chosenPick = inline && recommendations ? (picks.find((p) => p.kind === chosenKind) ?? picks[0] ?? null) : null
  const ringTotal = chosenPick ? formatPrice(set + chosenPick.stone.price) : total

  return (
    <AccordionFrame
      galleryFull={false}
      // 8px side gutter, lined up with the breadcrumb (as the /flow stone step).
      gallery={<div className="px-2"><FlowStoneGallery shape={effectiveShape(prefs)} size={chosenPick?.stone.size ?? sim.size} mode="preview" /></div>}
      panel={
        <div className="flex flex-col gap-6" data-variant={variant.id}>
          <BuildPanel
            current="stone"
            ringTotal={ringTotal}
            lines={[
              { label: "Setting", desc: setting.name, value: formatPrice(set) },
              chosenPick ? { label: "Stone", desc: stoneTitle(chosenPick.stone), value: formatPrice(chosenPick.stone.price) } : {
                label: "Stone",
                desc: (
                  <>
                    {stoneName(prefs, sim.scope.shape)} (<span className="font-semibold">{formatSize(sim.size, sim.sizes.unit)} ±</span>)
                  </>
                ),
                value: stonePrice,
              },
            ]}
            total={ringTotal}
          >
            {inline && recommendations ? (
              <InlineRecommendations
                picks={picks}
                selected={chosenPick}
                onChoose={setChosenKind}
                heading={picksHeading(prefs.type, effectiveShape(prefs), prefs.gem)}
                basis={<Basis shopBy={matchedBy} sim={sim} />}
                bySize={matchedBy === "size" || !sim.inBudget}
                onEditPreferences={() => navigate(href("preferences"))}
                onSelect={(p) => selectDiamond(toQuickviewDiamond(p.stone))}
                onFullDetails={(p) => {
                  navigate(flow ? flow.path(`${FLOW_ROUTES.diamond(p.stone.id)}?from=recs`) : FLOW_ROUTES.diamond(p.stone.id))
                  window.scrollTo({ top: 0 })
                }}
                viewAll={
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={viewAll.guard(() => navigate(href("diamonds", { from: "recs" })))}
                  >
                    View all {shapeLabel} stones ({matching.length.toLocaleString("en-US")})
                  </Button>
                }
              />
            ) : (
              <>
                {/* Natural diamonds, plus lab-grown in the study; the rest show "not part of this test". */}
                <StoneTypeToggle value={prefs.type} onChange={(type) => (stoneTypes.carries(type) ? update({ type }) : stoneTypes.notCarried())} />
                <ShapeSelector value={sim.scope.shape} onChange={(shape) => update({ shape })} offered={shapesFor(prefs.type, prefs.gem)} />
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
                <div className="flex flex-col gap-2">
                  {sim.blocked && (
                    <p className="pb-2 text-xs leading-4 text-muted-foreground">
                      {shopBy !== "budget" ? "No stones are available at this size right now. Choose a different size to continue." : "No stones in this budget right now. Widen your budget to continue."}
                    </p>
                  )}
                  <Button className="w-full" onClick={() => navigate(href("recommendations"))} disabled={sim.blocked || matching.length === 0}>
                    View Recommended Stones
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={viewAll.guard(() => navigate(href("diamonds", { from: "prefs" })))}
                    disabled={sim.blocked}
                  >
                    View all {shapeLabel} stones ({matching.length.toLocaleString("en-US")})
                  </Button>
                </div>
              </>
            )}
          </BuildPanel>
          <SaveAndHint />
          <ChatLink />
          {!inline && (
            <RecommendationsSheet
              open={recommendations}
              onClose={() => navigate(href("preferences"))}
              picks={picks}
              basis={basis}
              bySize={shopBy === "size" || !sim.inBudget}
              settingPrice={set}
              stoneCount={matching.length}
              onEditPreferences={() => navigate(href("preferences"))}
              onSelect={(p) => selectDiamond(toQuickviewDiamond(p.stone))}
              onViewAll={viewAll.guard(() => navigate(href("diamonds", { from: "recs" })))}
            />
          )}
        </div>
      }
    />
  )
}

/** Stone recommendations: the stone step with the recommendations modal open (Figma 7541:353247). The same component, so the page stays mounted. */
export const AccordionRecommendations = AccordionStone

/* ───────────── Step 3 · Finishing touches ───────────── */

/** The ring's price lines (Figma 7549:388533): setting, stone and any finishing touches. */
function useRingLines() {
  const { setting, stone, crown, engraving, band, bandEngraving, total } = useRingBuild()
  const lines: PriceLine[] = [
    { label: "Setting", desc: setting.name, value: formatPrice(setting.price) },
    { label: "Stone", desc: stone.title, value: formatPrice(stone.price) },
    ...(crown ? [{ label: "Crown", desc: crown.name, value: formatPrice(crown.price) }] : []),
    ...(engraving ? [{ label: "Engraving", desc: `“${engraving.text}”`, value: formatPrice(ENGRAVING.price) }] : []),
    ...(band ? [{ label: "Wedding Band", desc: band.name, value: formatPrice(band.price) }] : []),
    ...(bandEngraving ? [{ label: "Band Engraving", desc: `“${bandEngraving.text}”`, value: formatPrice(ENGRAVING.price) }] : []),
  ]
  return { lines, total: formatPrice(total) }
}

/**
 * Step 3's gallery, shared by Finishing Touches and Review (Lucid note: "Match the previous step gallery"):
 * the ring with the chosen stone large first, the crown high up (another note), then the rest.
 */
function useStep3Gallery() {
  const { crown } = useRingBuild()
  const { finishing } = useFlowRingGallery()
  return useMemo<GalleryImage[]>(() => {
    const [hero, ...rest] = finishing
    return [
      hero,
      ...(crown
        ? [{ src: crown.image, alt: crown.name, fit: "contain" as const }]
        : [{ src: CLASSIC_CROWN.image, alt: CLASSIC_CROWN.name, fit: "contain" as const, badge: "Crown on ring", badgePosition: "bottom" as const }]),
      ...rest,
    ]
  }, [finishing, crown])
}

/** Finishing Touches (Lucid "Step 3 – Finishing Touches: personalize & size"): Test 4 B's sections in the panel. */
export function AccordionFinish() {
  const go = useGo()
  const notInTest = useNotInTest()
  const { open, sheets } = useFinishingOverlays(null)
  const { ringSize } = useRingBuild()
  const gallery = useStep3Gallery()
  const { lines, total } = useRingLines()
  const [tried, setTried] = useState(false)
  const sizeError = tried && !ringSize ? "Select a ring size to continue." : undefined

  const proceed = () => {
    if (!ringSize) {
      setTried(true)
      document.getElementById("ring-size")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    go(FLOW_ROUTES.review)
  }

  return (
    <AccordionFrame
      // Test 4's gallery pads 8px all round; pulled up so it starts right under the breadcrumb.
      gallery={<div className="lg:-mt-2"><ProductGallery images={gallery} /></div>}
      panel={
        <div className="flex flex-col gap-6">
          {/* Figma 7549:388638: ring size first, then personalization and the wedding band. */}
          <BuildPanel current="finishing" ringTotal={total} lines={lines} total={total}>
            <RingSizeSection id="ring-size" onOpen={open} error={sizeError} />
            <PersonalizeSection onOpen={open} />
            <WeddingBandSection onOpen={open} />
            <Button className="w-full" onClick={proceed}>
              Proceed to Review
            </Button>
          </BuildPanel>
          <Button variant="link" className="h-auto self-start gap-2 px-0 py-2" onClick={() => notInTest("Chat")}>
            <ChatCircleIcon /> Chat with a jewelry consultant
          </Button>
          {sheets}
        </div>
      }
    />
  )
}

/** Review (Lucid "Step 4 – Review Your Ring"): every step summarised with Edit, the total and Add to Bag. */
export function AccordionReview() {
  const flow = useFlow()
  const go = useGo()
  const addToBag = useStudyAddToBag(() => go(FLOW_ROUTES.added))
  const { ringSize } = useRingBuild()
  const { lines, total } = useRingLines()
  // Same gallery as Finishing Touches.
  const gallery = useStep3Gallery()
  // Ring size is chosen on Finishing Touches; without it, back there.
  if (!ringSize) return <Navigate to={flow ? flow.path(FLOW_ROUTES.finish) : FLOW_ROUTES.finish} replace />

  return (
    <AccordionFrame
      gallery={<div className="lg:-mt-2"><ProductGallery images={gallery} /></div>}
      panel={
        <div className="flex flex-col gap-6">
          {/* Figma 7549:392444: every step closed, the price box, then Add Ring to Bag. */}
          <BuildPanel
            current="review"
            ringTotal={total}
            lines={lines}
            total={total}
            footer={
              // Figma 7549:394197: Add Ring to Bag, then Save and Drop a Hint, then the chat link centred.
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={addToBag}>
                    Add Ring to Bag
                  </Button>
                  <SaveAndHint />
                </div>
                <ChatLink />
              </div>
            }
          />
          <Assurances />
          <DyoDeliveryOptions />
        </div>
      }
    />
  )
}
