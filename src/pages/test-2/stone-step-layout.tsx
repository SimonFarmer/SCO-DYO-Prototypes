import { useEffect, type ReactNode } from "react"
import { useLocation } from "react-router"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { SiteHeader } from "@/components/site/site-header"
import { StoneStepGallery } from "@/components/stones/stone-step-gallery"
import { SETTING } from "@/data/dyo"
import { cn, PAGE_MAX } from "@/lib/utils"
import { chosenSize, effectiveShape, type StonePrefs } from "./preferences"

/** Same columns as the Settings PDP (Test 1, Figma 826 + 606 with an 8px gap), so step 1 and step 2 line up. */
const COLUMNS = "grid lg:grid-cols-[826fr_606fr] lg:gap-2"

/**
 * DYO step 2 page frame (Figma "A: Size selector" … "Recommendations"), laid out exactly like the
 * Settings PDP in Test 1 A: header, stepper, the breadcrumb row over the gallery column, then the
 * long-scroll gallery beside a sticky buy form. 2a (preferences) and 2b (recommendations) swap only
 * the buy-form column. The buy form sticks for every stone type, gemstones included.
 */
export function StoneStepLayout({
  prefs,
  size,
  previewNote,
  children,
}: {
  prefs: StonePrefs
  /** Size the preview shows (carats for diamonds, millimetres for gemstones); defaults to the chosen size */
  size?: number
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
      <SiteHeader contained />
      <DyoStepper current={2} mobileLabel="Stone" contained />
      {/* Content stops growing at 1680px and centres; the header and stepper bars still run full width. */}
      <main className={PAGE_MAX}>
        {/* Figma: breadcrumb is its own 48px row above the gallery column. */}
        <div className={COLUMNS}>
          <Breadcrumb items={["Home", "Engagement Rings", SETTING.name]} className="mx-2 bg-secondary" />
        </div>
        <div className={COLUMNS}>
          <div>
            <StoneStepGallery
              type={prefs.type}
              shape={effectiveShape(prefs)}
              size={size ?? chosenSize(prefs)}
              gem={prefs.gem}
              previewNote={previewNote}
            />
          </div>
          {/* Mobile: 24px between the gallery and the buy form. */}
          <aside className="px-margin pt-6 pb-8 lg:px-14 lg:pt-5">
            {/* Sticks below the sticky-on-intent header when that is showing (--header-offset), as in Test 1 A. */}
            <div
              className={cn(
                "mx-auto flex max-w-xl flex-col gap-6 lg:mx-0 lg:max-w-none lg:gap-8",
                "transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+--spacing(5))]",
              )}
            >
              {children}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
