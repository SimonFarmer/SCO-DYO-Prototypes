import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { ChatCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
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
import { PriceBreakdown } from "@/components/dyo/price-breakdown"
import { ProductGallery } from "@/components/dyo/product-gallery"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { SiteHeader } from "@/components/site/site-header"
import { CLASSIC_CROWN, FINISHING_GALLERY, type GalleryImage } from "@/data/dyo"
import { useRingBuild } from "@/state/ring-build"
import { PageColumns } from "./page-columns"

const OVERLAYS: FinishingOverlay[] = ["size", "size-guide", "engraving", "crown", "band", "band-engraving"]

/**
 * Test 4 · Variant B, screen 1 — Finishing Touches as its own step, before Ring Review.
 * Figma: Test 4 › "Ring Review (B)" (7366:137030) and the crown-added state (7366:137725).
 * ?open=crown|engraving|band|band-engraving|size opens an overlay on arrival (used by Edit links on Ring Review).
 */
export function FinishingTouchesB() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const [params, setParams] = useSearchParams()
  const requested = params.get("open") as FinishingOverlay
  const { open, sheets } = useFinishingOverlays(OVERLAYS.includes(requested) ? requested : null)
  const { ringSize, crown } = useRingBuild()
  // Shown after a Proceed attempt without a size; clears itself once a size is chosen.
  const [triedProceed, setTriedProceed] = useState(false)
  const sizeError = triedProceed && !ringSize ? "Select a ring size to continue." : undefined

  // Drop ?open= once consumed so a refresh doesn't reopen the overlay.
  useEffect(() => {
    if (params.has("open")) {
      params.delete("open")
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const gallery = useMemo<GalleryImage[]>(
    () => [
      FINISHING_GALLERY.hero,
      ...(crown
        ? [FINISHING_GALLERY.ringSide, { src: crown.image, alt: crown.name, fit: "contain" as const }]
        : []),
      ...FINISHING_GALLERY.tiles,
      // Figma 7366:137030: the standard crown closes the gallery, with a shortcut to upgrade it.
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
    ],
    [crown, open]
  )

  const proceed = () => {
    if (!ringSize) {
      setTriedProceed(true)
      document.getElementById("ring-size")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    navigate("/test-4/b/review")
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <DyoStepper current={3} mobileLabel="Personalize" />
      <PageColumns
        gallery={<ProductGallery images={gallery} />}
      >
        <StepIntro
          eyebrow="Step 3 of 3 · Finishing Touches"
          title="Complete your ring"
          subtitle="Add the final details to make your ring yours."
        />
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
    </div>
  )
}
