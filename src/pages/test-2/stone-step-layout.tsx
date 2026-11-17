import { useEffect, type ReactNode } from "react"
import { useLocation } from "react-router"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { PageColumns } from "@/components/dyo/page-columns"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteHeader } from "@/components/site/site-header"
import { StoneStepGallery } from "@/components/stones/stone-step-gallery"
import { SETTING } from "@/data/dyo"
import type { StonePrefs } from "./preferences"

/**
 * DYO step 2 page frame (Figma "A: Size selector" … "Recommendations"): header, stepper,
 * breadcrumb row over the gallery column, then gallery + buy-form columns.
 * 2a (preferences) and 2b (recommendations) swap only the buy-form column.
 */
export function StoneStepLayout({
  prefs,
  carat,
  previewNote,
  children,
}: {
  prefs: StonePrefs
  carat?: number
  /** Appended to the gallery's "Previewing" badge */
  previewNote?: string
  children: ReactNode
}) {
  // Moving between 2a and 2b starts at the top (query changes from the sliders don't).
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <DyoStepper current={2} mobileLabel="Stone" />
      <div className="grid lg:grid-cols-[7fr_5fr]">
        <Breadcrumb items={["Home", "Engagement Rings", SETTING.name]} className="bg-secondary lg:mx-2" />
      </div>
      <PageColumns gallery={<StoneStepGallery type={prefs.type} shape={prefs.shape} carat={carat ?? prefs.carat} previewNote={previewNote} />}>
        {children}
      </PageColumns>
    </div>
  )
}
