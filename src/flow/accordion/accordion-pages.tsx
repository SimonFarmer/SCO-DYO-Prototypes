import { useMemo, useState, type ReactNode } from "react"
import { Navigate, useNavigate } from "react-router"
import { ChatCircleIcon, HeartStraightIcon } from "@phosphor-icons/react"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { Assurances, DeliveryOptions as DyoDeliveryOptions } from "@/components/dyo/buy-actions"
import {
  PersonalizeSection,
  RingSizeSection,
  WeddingBandSection,
  useFinishingOverlays,
} from "@/components/dyo/finishing-sections"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { ProductInfoDrawer } from "@/components/pdp/product-info-drawer"
import type { ProductInfoTab } from "@/components/pdp/product-info"
import { DeliveryOptions, DyoAssurances, MetalSelector, PriceExplained } from "@/components/pdp/setting-buy-form"
import { SettingGallery } from "@/components/pdp/setting-gallery"
import { StonePreviewMenu } from "@/components/pdp/stone-preview-menu"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Breadcrumb, type Crumb } from "@/components/site/breadcrumb"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { ShapeSelector, StoneTypeToggle } from "@/components/stones/preference-parts"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { CLASSIC_CROWN, ENGRAVING, type GalleryImage } from "@/data/dyo"
import { PLP_PATH, SHAPES } from "@/data/plp"
import { flowMetalFor, flowSettingFor, flowSettingStyle } from "@/data/flow-settings"
import { descriptionFor, galleryFor } from "@/data/products"
import { formatSize, recommend, shapesFor, stoneShape, stoneTitle, toQuickviewDiamond, type StonePick } from "@/data/stones"
import { useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { useFlowRingGallery } from "@/flow/ring-images"
import { FlowStoneGallery } from "@/flow/stone/flow-stone-gallery"
import { BudgetSection, SizeSection, stoneName } from "@/flow/stone/preferences-page"
import { Basis, PickTile, picksHeading } from "@/flow/stone/recommendations-page"
import { firstStoneQuery, flowStonePath, effectiveShape, useFlowStonePrefs } from "@/flow/stone/simulator"
import { useFlowSelectDiamond } from "@/flow/stone/use-flow-stone"
import { formatPrice } from "@/lib/format"
import { cn, PAGE_MAX } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"
import { BuildPanel, PanelTotals } from "./build-panel"

/*
 * Accordion steps flow (/flow-accordion) · the pages. A separate moderated flow test (Lucid "Shane Co DYO Full
 * Flow and Steps Interface" › "Alternate UX – Accordion steps (Continuous PDP-style)"): every step keeps the
 * PDP layout (gallery left, "Design Your Ring" panel right) instead of the 1/2/3 bar. Wireframes only, so it is
 * built from the existing components and tokens; the logic is the /flow pages' (Ella Cathedral, Test 2's stock,
 * Test 4's finishing touches). /flow and the unmoderated tests are untouched.
 */

const COLUMNS = "grid lg:grid-cols-[826fr_606fr] lg:gap-2"

/** The wireframes' trail: the product's own breadcrumb, ending on the picked setting (Home › … › its name). */
function productCrumbs(settingId: string | null | undefined): Crumb[] {
  const style = flowSettingStyle(settingId)
  return [
    { label: "Home", to: "/shop" },
    { label: "Engagement Rings", to: PLP_PATH },
    { label: style.label, to: `${PLP_PATH}/${style.id}` },
    flowSettingFor(settingId).name,
  ]
}

/** Header, the product breadcrumb, then gallery and panel side by side (stacked on phones), footer, mobile bar. */
function AccordionFrame({ gallery, panel, galleryFull = true }: { gallery: ReactNode; panel: ReactNode; galleryFull?: boolean }) {
  const flow = useFlow()
  const { settingId } = useRingBuild()
  // No jump to the top here: the panel scrolls the page to the current step (BuildPanel).
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader contained navigation />
      <main className={PAGE_MAX}>
        {flow?.config.crumbs && (
          <div className={COLUMNS}>
            <Breadcrumb items={productCrumbs(settingId)} className="mx-2 bg-secondary" />
          </div>
        )}
        <div className={COLUMNS}>
          {/* A single preview image stays in view while the panel scrolls; long galleries scroll beside a sticky panel. */}
          <div className={cn(!galleryFull && "transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset) lg:self-start lg:pb-8")}>{gallery}</div>
          <aside className="px-margin pt-8 pb-12 lg:px-14 lg:pt-5">
            <div className={cn(galleryFull && "transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+--spacing(5))]")}>{panel}</div>
          </aside>
        </div>
      </main>
      <SiteFooter contained />
      <MobileBottomNav />
    </div>
  )
}

/** "Chat with a jewelry consultant" under the panel. */
function ChatLink() {
  const notInTest = useNotInTest()
  return (
    <Button variant="link" className="h-auto self-start gap-2 px-0 py-2" onClick={() => notInTest("Chat")}>
      <ChatCircleIcon /> Chat with a jewelry consultant
    </Button>
  )
}

/** Primary CTA with an underlined secondary link under it ("View all round stones (1,034)"). */
function StepCtas({ primary, onPrimary, disabled, link }: { primary: string; onPrimary: () => void; disabled?: boolean; link?: { label: string; onClick: () => void; disabled?: boolean } }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button className="w-full" onClick={onPrimary} disabled={disabled}>
        {primary}
      </Button>
      {link && (
        <Button variant="link" className="h-auto px-0" onClick={link.onClick} disabled={link.disabled}>
          {link.label}
        </Button>
      )}
    </div>
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

/** Setting step (Lucid "Step 1 – Setting PDP (accordion steps)"): Test 1 B's long gallery and 2-line teaser. */
export function AccordionSetting() {
  const flow = useFlow()
  const go = useGo()
  const notInTest = useNotInTest()
  const { settingId, settingMetal, setSettingMetal, shape, setting: built } = useRingBuild()
  const setting = flowSettingFor(settingId)
  const metal = flowMetalFor(setting, settingMetal)
  const variant = setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]
  const [previewShape, setPreviewShape] = useState(shape && setting.shapes.includes(shape) ? shape : setting.shapes[0])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTab, setDetailsTab] = useState<ProductInfoTab>("overview")
  const { carat } = setting.previewStone
  const shapeLabel = SHAPES.find((s) => s.id === previewShape)?.label ?? setting.previewStone.shape
  const media = galleryFor(setting, metal, previewShape)

  const next = () => go(flowStonePath("preferences", firstStoneQuery(flow?.config.t2 ?? "B", previewShape)))

  return (
    <AccordionFrame
      gallery={
        <SettingGallery
          key={metal}
          media={media}
          previewLabel={`Previewing: ${shapeLabel} ∙ ${carat.toFixed(2)} ct`}
          previewMenu={<StonePreviewMenu shapes={setting.shapes} value={previewShape} onChange={setPreviewShape} mobileDetail={`${carat.toFixed(2)} ct`} />}
          previewShape={previewShape}
        />
      }
      panel={
        <div className="flex flex-col gap-6">
          <BuildPanel
            current="setting"
            footer={
              <PanelTotals
                rows={[
                  { label: "Setting", value: formatPrice(built.price) },
                  { label: "Center stone", value: "Not selected" },
                ]}
                totalLabel="Ring total so far"
                total={formatPrice(built.price)}
              />
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="type-h3 text-primary">{setting.name}</h2>
              <p className="type-caption text-muted-foreground">
                {built.metal} · Article No. {variant.articleNo}
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-semibold text-primary">{formatPrice(variant.price)}</span>
                <span className="type-label-xs font-medium text-muted-foreground">Setting only</span>
                <PriceExplained price={variant.price} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="line-clamp-2 text-sm font-medium text-muted-foreground">{descriptionFor(setting, metal)}</p>
                <Button variant="link" className="h-auto w-fit px-0 py-1" onClick={() => setDetailsOpen(true)}>
                  View full product details
                </Button>
              </div>
            </div>
            <MetalSelector options={setting.variants.map((v) => ({ metal: v.metal, price: v.price }))} value={metal} onChange={setSettingMetal} />
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={next}>
                Select this Setting &amp; Continue
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => notInTest("Saving")}>
                  <HeartStraightIcon /> Save
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => notInTest("Drop a hint")}>
                  Drop a Hint
                </Button>
              </div>
            </div>
          </BuildPanel>
          <DyoAssurances />
          <DeliveryOptions />
          <ChatLink />
          <ProductInfoDrawer
            setting={setting}
            metal={metal}
            previewShape={previewShape}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            tab={detailsTab}
            onTabChange={setDetailsTab}
          />
        </div>
      }
    />
  )
}

/* ───────────── Step 2 · Stone ───────────── */

/** Stone preferences (Lucid "Step 2a – Find your Stone: preferences & preview"); slider only, as Test 2. */
export function AccordionStone() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const { variant, prefs, sim, update, setSize, matching, href, setting } = useFlowStonePrefs()
  const { shopBy } = variant
  const set = setting.price
  const r5 = (n: number) => Math.round(n / 5) * 5
  const range = (a: number, b: number) => `${formatPrice(r5(a))} – ${formatPrice(r5(b))}`
  // Same numbers as the /flow preferences page's Price Explained.
  const stonePrice =
    shopBy === "both" && sim.inBudget ? (sim.overlap ? range(sim.overlap.lo - set, sim.overlap.hi - set) : "—") : sim.blocked || !sim.row ? "—" : range(sim.row.min, sim.row.max)
  const total =
    sim.pickMode === "size"
      ? sim.sizeRing
        ? range(sim.sizeRing.lo, sim.sizeRing.hi)
        : "—"
      : shopBy === "budget"
        ? `${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)}`
        : sim.overlap
          ? range(sim.overlap.lo, sim.overlap.hi)
          : "—"
  const inBudget = shopBy === "size" ? "" : shopBy === "both" && !sim.inBudget ? ", outside budget" : ", in budget"
  const size = <SizeSection sim={sim} setSize={setSize} shopBy={shopBy} />
  const budget = <BudgetSection sim={sim} update={update} interactive={shopBy !== "size"} withBand={shopBy === "size"} />

  return (
    <AccordionFrame
      galleryFull={false}
      // 8px side gutter, lined up with the breadcrumb (as the /flow stone step).
      gallery={<div className="px-2"><FlowStoneGallery shape={effectiveShape(prefs)} size={sim.size} mode="preview" /></div>}
      panel={
        <div className="flex flex-col gap-6" data-variant={variant.id}>
          <BuildPanel
            current="stone"
            footer={
              <PanelTotals
                rows={[
                  { label: "Setting", value: formatPrice(set) },
                  { label: `${stoneName(prefs, sim.scope.shape)} (${formatSize(sim.size, sim.sizes.unit)} ±${inBudget})`, value: stonePrice },
                ]}
                totalLabel="Estimated ring total"
                total={total}
              />
            }
          >
            <p className="text-sm leading-5 text-muted-foreground">Tell us what you're looking for and we'll recommend stones to suit your ring and budget.</p>
            {/* This flow carries natural diamonds only for now. */}
            <StoneTypeToggle value={prefs.type} onChange={(type) => (type === "natural" ? update({ type }) : notInTest("Lab-grown diamonds and gemstones"))} />
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
            {sim.blocked && (
              <p className="-mb-2 text-xs leading-4 text-muted-foreground">
                {shopBy !== "budget" ? "No stones are available at this size right now. Choose a different size to continue." : "No stones in this budget right now. Widen your budget to continue."}
              </p>
            )}
            <StepCtas
              primary="View Recommended Stones"
              onPrimary={() => navigate(href("recommendations"))}
              disabled={sim.blocked || matching.length === 0}
              link={{
                label: `View all ${stoneShape(prefs.shape).label.toLowerCase()} stones (${matching.length.toLocaleString("en-US")})`,
                onClick: () => navigate(href("diamonds", { from: "prefs" })),
                disabled: sim.blocked,
              }}
            />
          </BuildPanel>
          <ChatLink />
        </div>
      }
    />
  )
}

/** Stone recommendations (Lucid "Step 2b – Find your Stone: recommendations"): Test 2's picks in the panel. */
export function AccordionRecommendations() {
  const navigate = useNavigate()
  const flow = useFlow()
  const selectDiamond = useFlowSelectDiamond()
  const { variant, prefs, sim, matching, href, setting } = useFlowStonePrefs()
  const { shopBy } = variant
  const picks = useMemo(
    () => (sim.blocked ? [] : recommend({ scope: sim.scope, mode: sim.pickMode, size: sim.size, stoneMin: sim.stoneMin, stoneMax: sim.stoneMax })),
    [sim],
  )
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const [quickview, setQuickview] = useState<StonePick | null>(null)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const opensQuickview = flow?.config.t31 !== "A"
  const toPdp = (id: string) => {
    navigate(flow ? flow.path(FLOW_ROUTES.diamond(id)) : FLOW_ROUTES.diamond(id))
    window.scrollTo({ top: 0 })
  }
  const shapeLabel = stoneShape(effectiveShape(prefs)).label
  const prefsLine = [
    "Natural",
    shapeLabel,
    formatSize(sim.size, sim.sizes.unit),
    ...(shopBy === "size" ? [] : [`${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)} ring budget`]),
  ].join(" · ")

  return (
    <>
      <AccordionFrame
        // Phones: 8px gutter like the breadcrumb; desktop: the long gallery brings its own.
        gallery={<div className="px-2 lg:px-0"><FlowStoneGallery shape={effectiveShape(prefs)} size={selected?.stone.size ?? sim.size} mode="full" /></div>}
        panel={
          <div className="flex flex-col gap-6" data-variant={variant.id}>
            <BuildPanel
              current="stone"
              footer={
                <PanelTotals
                  rows={[
                    { label: `Setting: ${setting.name.replace(/ Engagement Ring$/, "")}, ${setting.metal}`, value: formatPrice(setting.price) },
                    ...(selected ? [{ label: `Stone: ${stoneTitle(selected.stone)}`, value: formatPrice(selected.stone.price) }] : []),
                  ]}
                  totalLabel="Ring total"
                  total={formatPrice(setting.price + (selected?.stone.price ?? 0))}
                />
              }
            >
              {/* The shopper's preferences, with the way back to change them. */}
              <div className="flex items-start justify-between gap-4 bg-bg-input-50 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="type-label-xs text-muted-foreground">Your preferences</p>
                  <p className="text-sm leading-5 text-primary">{prefsLine}</p>
                </div>
                <button type="button" onClick={() => navigate(href("preferences"))} className="shrink-0 cursor-pointer type-label-xs text-primary underline">
                  Edit preferences
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="type-h4 text-primary">{picksHeading(prefs.type, effectiveShape(prefs), prefs.gem)}</h2>
                <Basis shopBy={shopBy} sim={sim} />
              </div>
              {selected ? (
                <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-2">
                  {picks.map((p) => (
                    <PickTile
                      key={p.kind}
                      pick={p}
                      selected={p.kind === selected.kind}
                      onSelect={() => setSelectedKind(p.kind)}
                      onDetails={() => (opensQuickview ? setQuickview(p) : toPdp(p.stone.id))}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
                  <p className="type-h5 text-primary">No stones match these preferences</p>
                  <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
                </div>
              )}
              <StepCtas
                primary="Select this Diamond & Continue"
                onPrimary={() => selected && selectDiamond(toQuickviewDiamond(selected.stone))}
                disabled={!selected}
                link={{
                  label: `View all ${shapeLabel.toLowerCase()} stones (${matching.length.toLocaleString("en-US")})`,
                  onClick: () => navigate(href("diamonds", { from: "recs" })),
                  disabled: sim.blocked,
                }}
              />
            </BuildPanel>
            <ChatLink />
          </div>
        }
      />
      <DiamondQuickview
        diamond={quickview && toQuickviewDiamond(quickview.stone)}
        title={quickview ? stoneTitle(quickview.stone) : undefined}
        noun="Diamond"
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={() => {
          const picked = quickview
          setQuickview(null)
          if (picked) selectDiamond(toQuickviewDiamond(picked.stone))
        }}
        onViewDetails={() => {
          const picked = quickview
          setQuickview(null)
          if (picked) toPdp(picked.stone.id)
        }}
      />
    </>
  )
}

/* ───────────── Step 3 · Finishing touches ───────────── */

/** The ring's price lines: setting, stone and any finishing touches. */
function useRingRows() {
  const { setting, stone, crown, engraving, band, bandEngraving, total } = useRingBuild()
  const rows = [
    { label: `Setting: ${setting.name.replace(/ Engagement Ring$/, "")}, ${setting.metal}`, value: formatPrice(setting.price) },
    { label: `Stone: ${stone.title}`, value: formatPrice(stone.price) },
    ...(crown ? [{ label: `Crown: ${crown.name}`, value: formatPrice(crown.price) }] : []),
    ...(engraving ? [{ label: "Engraving", value: formatPrice(ENGRAVING.price) }] : []),
    ...(band ? [{ label: `Band: ${band.name}`, value: formatPrice(band.price) }] : []),
    ...(bandEngraving ? [{ label: "Band engraving", value: formatPrice(ENGRAVING.price) }] : []),
  ]
  return { rows, total: formatPrice(total) }
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
  const { rows, total } = useRingRows()
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
          <BuildPanel current="finishing" footer={<PanelTotals rows={rows} totalLabel="Ring total" total={total} />}>
            <p className="text-sm leading-5 text-muted-foreground">Add the final details to make your ring yours.</p>
            <PersonalizeSection onOpen={open} />
            <WeddingBandSection onOpen={open} />
            <RingSizeSection id="ring-size" onOpen={open} error={sizeError} />
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
  const notInTest = useNotInTest()
  const { ringSize, total } = useRingBuild()
  // Same gallery as Finishing Touches.
  const gallery = useStep3Gallery()
  // Ring size is chosen on Finishing Touches; without it, back there.
  if (!ringSize) return <Navigate to={flow ? flow.path(FLOW_ROUTES.finish) : FLOW_ROUTES.finish} replace />

  return (
    <AccordionFrame
      gallery={<div className="lg:-mt-2"><ProductGallery images={gallery} /></div>}
      panel={
        <div className="flex flex-col gap-6">
          <BuildPanel
            current="review"
            footer={
              <div className="flex flex-col gap-6 px-margin py-6 lg:px-6">
                <div className="flex items-baseline justify-between gap-4 text-primary">
                  <span className="text-base leading-6 font-semibold">Total</span>
                  <span className="text-2xl leading-8 font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => go(FLOW_ROUTES.added)}>
                    Add Ring to Bag
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => notInTest("Saving")}>
                      Save
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => notInTest("Booking an appointment")}>
                      Book an Appointment
                    </Button>
                  </div>
                </div>
              </div>
            }
          />
          <Assurances />
          <DyoDeliveryOptions />
          <ChatLink />
        </div>
      }
    />
  )
}
