import { useNavigate } from "react-router"
import { Assurances, BuyActions, DeliveryOptions } from "@/components/dyo/buy-actions"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import {
  PersonalizeSection,
  RingSizeSection,
  SectionDivider,
  StepIntro,
  useFinishingOverlays,
} from "@/components/dyo/finishing-sections"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { RingSummary } from "@/components/dyo/ring-summary"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteHeader } from "@/components/site/site-header"
import { REVIEW_GALLERY } from "@/data/dyo"
import { PageColumns } from "./page-columns"

/**
 * Test 4 · Variant A — options on the Ring Review step (current flow).
 * Figma: SCO Drop 3b – Customizer › Test 4 › "Step 3 — Review your ring" (7366:137280).
 * Starts on Ring Review with setting + stone chosen; ends at Add to bag.
 */
export function RingReviewA() {
  const navigate = useNavigate()
  const { open, sheets } = useFinishingOverlays()

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <DyoStepper current={3} mobileLabel="Review" />
      <PageColumns
        gallery={
          <>
            <Breadcrumb items={["Home", "Diamonds", "Brilliant Round Natural Diamond"]} className="max-lg:bg-background max-lg:px-margin max-lg:py-3" />
            <ProductGallery images={REVIEW_GALLERY} />
          </>
        }
      >
        <StepIntro
          eyebrow="Step 3 of 3 · Finishing Touches"
          title="Review Your Ring"
          subtitle="Add the final details to make your ring yours."
        />
        <SectionDivider />
        <RingSizeSection onOpen={open} />
        <SectionDivider />
        <PersonalizeSection onOpen={open} />
        <SectionDivider />
        <section aria-label="Ring summary">
          <RingSummary onEditCrown={() => open("crown")} onEditEngraving={() => open("engraving")} />
        </section>
        <SectionDivider />
        <BuyActions onAddToBag={() => navigate("/test-4/added?variant=A")} />
        <Assurances />
        <DeliveryOptions />
      </PageColumns>
      {sheets}
    </div>
  )
}
