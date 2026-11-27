import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router"
import { ChatCircleIcon, CheckCircleIcon } from "@phosphor-icons/react"
import { Assurances, BuyActions, DeliveryOptions } from "@/components/dyo/buy-actions"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import {
  PersonalizeSection,
  RingSizeSection,
  SectionDivider,
  StepIntro,
  WeddingBandSection,
  useFinishingOverlays,
  type FinishingOverlay,
} from "@/components/dyo/finishing-sections"
import { PageColumns } from "@/components/dyo/page-columns"
import { PriceBreakdown } from "@/components/dyo/price-breakdown"
import { FlowProductGallery } from "@/flow/flow-product-gallery"
import { RingSummary } from "@/components/dyo/ring-summary"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Breadcrumb, type Crumb } from "@/components/site/breadcrumb"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { CLASSIC_CROWN, type GalleryImage } from "@/data/dyo"
import { useFlow } from "@/flow/flow-context"
import { FLOW_CRUMBS, FLOW_ROUTES } from "@/flow/flow-paths"
import { useStudyAddToBag } from "@/flow/study/study"
import { useFlowRingGallery } from "@/flow/ring-images"
import { PAGE_MAX } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"

/*
 * Full DYO flow · step 3. Copies of Test 4's pages (src/pages/test-4) so Test 4 stays untouched:
 * t4 B (default) = Finishing Touches → Ring Review; t4 A = options on Ring Review. Differences: flow routes,
 * live header navigation, the flow breadcrumb and mobile bar, and galleries of the ring actually being
 * built (Ella Cathedral in the chosen metal with the chosen stone). Keep visual fixes in sync with Test 4.
 */

const OVERLAYS: FinishingOverlay[] = ["size", "size-guide", "engraving", "crown", "band", "band-engraving"]

/** Header, stepper and the flow breadcrumb over the gallery column, then the page, then the mobile bar. */
function FlowStep3Frame({ mobileLabel, crumbs, children }: { mobileLabel: string; crumbs: Crumb[]; children: ReactNode }) {
  const flow = useFlow()
  // Each step 3 screen starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])
  return (
    <div className="min-h-svh bg-background">
      <SiteHeader navigation />
      <DyoStepper current={3} mobileLabel={mobileLabel} />
      {flow?.config.crumbs && (
        // Sits over the gallery column, inside the 1680px page cap (PAGE_MAX) as the columns below.
        <div className={PAGE_MAX}>
          <div className="bg-secondary lg:w-7/12">
            <Breadcrumb items={crumbs} className="px-margin lg:px-4" />
          </div>
        </div>
      )}
      {children}
      <MobileBottomNav />
    </div>
  )
}

function useFlowNav() {
  const flow = useFlow()
  const navigate = useNavigate()
  return (to: string) => navigate(flow ? flow.path(to) : to)
}

/** /flow/finish: step 3's first screen for the flow's Test 4 variant. */
export function FlowStep3() {
  const flow = useFlow()
  return flow?.config.t4 === "A" ? <FlowRingReviewA /> : <FlowFinishingTouches />
}

/** t4 B · Finishing Touches as its own step (Test 4 B, Figma 7366:137030). */
function FlowFinishingTouches() {
  const go = useFlowNav()
  const notInTest = useNotInTest()
  const [params, setParams] = useSearchParams()
  const requested = params.get("open") as FinishingOverlay
  const { open, sheets } = useFinishingOverlays(OVERLAYS.includes(requested) ? requested : null)
  const { ringSize, crown } = useRingBuild()
  const { finishing } = useFlowRingGallery()
  const [triedProceed, setTriedProceed] = useState(false)
  const sizeError = triedProceed && !ringSize ? "Select a ring size to continue." : undefined

  useEffect(() => {
    if (params.has("open")) {
      params.delete("open")
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const gallery = useMemo<GalleryImage[]>(() => {
    const [hero, ...rest] = finishing
    return [
      hero,
      ...(crown ? [{ src: crown.image, alt: crown.name, fit: "contain" as const }] : []),
      ...rest,
      ...(crown
        ? []
        : [
            {
              src: CLASSIC_CROWN.image,
              alt: CLASSIC_CROWN.name,
              fit: "contain" as const,
              badgePosition: "bottom" as const,
              badge: (
                <>
                  Crown on ring ·{" "}
                  <button type="button" className="cursor-pointer uppercase underline" onClick={() => open("crown")}>
                    Upgrade
                  </button>
                </>
              ),
            },
          ]),
    ]
  }, [finishing, crown, open])

  const proceed = () => {
    if (!ringSize) {
      setTriedProceed(true)
      document.getElementById("ring-size")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    go(FLOW_ROUTES.review)
  }

  return (
    <FlowStep3Frame mobileLabel="Personalize" crumbs={FLOW_CRUMBS.finish}>
      <PageColumns gallery={<FlowProductGallery images={gallery} />}>
        <StepIntro eyebrow="Step 3 of 3 · Finishing Touches" title="Complete your ring" subtitle="Add the final details to make your ring yours." />
        <SectionDivider />
        <PersonalizeSection onOpen={open} />
        <SectionDivider />
        <WeddingBandSection onOpen={open} />
        <SectionDivider />
        <RingSizeSection id="ring-size" onOpen={open} error={sizeError} />
        <SectionDivider />
        <PriceBreakdown />
        <div className="flex flex-col gap-4">
          <Button className="w-full" onClick={proceed}>
            Proceed to Review
          </Button>
          <Button variant="link" className="self-center" onClick={() => notInTest("Chat")}>
            <ChatCircleIcon /> Chat with a Jewelry Consultant
          </Button>
        </div>
      </PageColumns>
      {sheets}
    </FlowStep3Frame>
  )
}

/** t4 A · Options on the Ring Review step (Test 4 A, Figma 7366:137280). */
function FlowRingReviewA() {
  const go = useFlowNav()
  const addToBag = useStudyAddToBag(() => go(FLOW_ROUTES.added))
  const { open, sheets } = useFinishingOverlays()
  const { review } = useFlowRingGallery()
  return (
    <FlowStep3Frame mobileLabel="Review" crumbs={FLOW_CRUMBS.review}>
      <PageColumns gallery={<FlowProductGallery images={review} />}>
        <StepIntro eyebrow="Step 3 of 3 · Finishing Touches" title="Review Your Ring" subtitle="Add the final details to make your ring yours." />
        <SectionDivider />
        <RingSizeSection onOpen={open} />
        <SectionDivider />
        <PersonalizeSection onOpen={open} />
        <SectionDivider />
        <section aria-label="Ring summary">
          <RingSummary onEditCrown={() => open("crown")} onEditEngraving={() => open("engraving")} />
        </section>
        <SectionDivider />
        <BuyActions onAddToBag={addToBag} />
        <Assurances />
        <DeliveryOptions />
      </PageColumns>
      {sheets}
    </FlowStep3Frame>
  )
}

/** /flow/review · t4 B's Ring Review, summarizing the finishing touches (Test 4 B, Figma 7366:137874). */
export function FlowRingReviewB() {
  const flow = useFlow()
  const go = useFlowNav()
  const addToBag = useStudyAddToBag(() => go(FLOW_ROUTES.added))
  const { ringSize } = useRingBuild()
  const { review } = useFlowRingGallery()
  const finishing = flow ? flow.path(FLOW_ROUTES.finish) : FLOW_ROUTES.finish

  // Ring size is chosen on Finishing Touches; without it, back there. (t4 A has no separate review.)
  if (flow?.config.t4 === "A" || !ringSize) return <Navigate to={finishing} replace />

  const backTo = (overlay: "crown" | "engraving" | "size" | "band" | "band-engraving") => go(`${FLOW_ROUTES.finish}?open=${overlay}`)

  return (
    <FlowStep3Frame mobileLabel="Review" crumbs={FLOW_CRUMBS.review}>
      <PageColumns gallery={<FlowProductGallery images={review} />}>
        <StepIntro eyebrow="Step 3 of 3 · Finishing Touches" title="Review Your Ring" onBack={() => go(FLOW_ROUTES.finish)} />
        <SectionDivider />
        <section aria-label="Ring summary">
          <RingSummary
            personalization="grouped"
            onEditRingSize={() => backTo("size")}
            onEditCrown={() => backTo("crown")}
            onEditEngraving={() => backTo("engraving")}
            onEditBand={() => backTo("band")}
            onEditBandEngraving={() => backTo("band-engraving")}
            onAddPersonalization={() => go(FLOW_ROUTES.finish)}
          />
        </section>
        <SectionDivider />
        <BuyActions onAddToBag={addToBag} />
        <Assurances />
        <DeliveryOptions />
      </PageColumns>
    </FlowStep3Frame>
  )
}

/** /flow/added · End of the flow: the ring in the bag (Test 4's end screen, for the flow's build). */
export function FlowAddedToBag() {
  const flow = useFlow()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])
  return (
    <div className="min-h-svh bg-secondary">
      <SiteHeader navigation />
      <main className="px-margin py-16 max-lg:py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-8 bg-background p-10 max-lg:p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircleIcon className="size-10 text-success" weight="fill" />
            <h1 className="type-h3 text-primary">Your ring has been added to your bag</h1>
          </div>
          <div className="h-px bg-muted" />
          <RingSummary readOnly thumbnail personalization={flow?.config.t4 === "A" ? "inline" : "grouped"} />
          <div className="flex flex-col gap-1 bg-bg-input-50 p-4 text-center">
            <p className="type-label-xs text-primary">This is the end of the task</p>
            <p className="type-caption text-muted-foreground">Please return to the moderator.</p>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  )
}
