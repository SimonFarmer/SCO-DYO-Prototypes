import { Navigate, useNavigate } from "react-router"
import { Assurances, BuyActions, DeliveryOptions } from "@/components/dyo/buy-actions"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { RingSummary } from "@/components/dyo/ring-summary"
import { SiteHeader } from "@/components/site/site-header"
import { REVIEW_GALLERY } from "@/data/dyo"
import { useRingBuild } from "@/state/ring-build"
import { PageColumns } from "./page-columns"

const FINISHING = "/test-4/b"

/**
 * Test 4 · Variant B, screen 2 — Ring Review summarizing the finishing touches.
 * Figma: Test 4 › "Order Review" (7366:137874). Edit links go back to Finishing Touches.
 */
export function RingReviewB() {
  const navigate = useNavigate()
  const { ringSize } = useRingBuild()

  // Ring size is chosen on Finishing Touches; without it, send the shopper back there.
  if (!ringSize) return <Navigate to={FINISHING} replace />

  const backTo = (open: "crown" | "engraving" | "size" | "band" | "band-engraving") => navigate(`${FINISHING}?open=${open}`)

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <DyoStepper current={3} mobileLabel="Review" />
      <PageColumns
        gallery={<ProductGallery images={REVIEW_GALLERY} />}
      >
        <StepIntro
          eyebrow="Step 3 of 3 · Finishing Touches"
          title="Review Your Ring"
          onBack={() => navigate(FINISHING)}
        />
        <SectionDivider />
        <section aria-label="Ring summary">
          <RingSummary
            personalization="grouped"
            onEditRingSize={() => backTo("size")}
            onEditCrown={() => backTo("crown")}
            onEditEngraving={() => backTo("engraving")}
            onEditBand={() => backTo("band")}
            onEditBandEngraving={() => backTo("band-engraving")}
            onAddPersonalization={() => navigate(FINISHING)}
          />
        </section>
        <SectionDivider />
        <BuyActions onAddToBag={() => navigate("/test-4/b/added")} />
        <Assurances />
        <DeliveryOptions />
      </PageColumns>
    </div>
  )
}
