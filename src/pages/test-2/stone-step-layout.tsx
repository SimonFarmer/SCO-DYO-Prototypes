import { useEffect, type ReactNode } from "react"
import { useLocation } from "react-router"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteHeader } from "@/components/site/site-header"
import { StoneStepGallery, type StoneGalleryMode } from "@/components/stones/stone-step-gallery"
import { cn, PAGE_MAX } from "@/lib/utils"
import { chosenSize, effectiveShape, type StonePrefs } from "./preferences"

/** Same columns as the Settings PDP (Test 1, Figma 826 + 606 with an 8px gap), so step 1 and step 2 line up. */
const COLUMNS = "grid lg:grid-cols-[826fr_606fr] lg:gap-2"

/**
 * DYO step 2 page frame (Figma "A: Size selector" … "Recommendations"), laid out exactly like the
 * Settings PDP in Test 1: header, stepper, the breadcrumb row over the gallery column, then the gallery
 * beside the buy form. 2a (preferences) shows the live preview alone and keeps it in view (sticky) while
 * the form scrolls; 2b (recommendations) shows every image in Test 1 A's long-scroll grid beside a
 * sticky buy form. Below lg both stack.
 */
export function StoneStepLayout({
  prefs,
  size,
  previewNote,
  gallery = "preview",
  children,
}: {
  prefs: StonePrefs
  /** Size the preview shows (carats for diamonds, millimetres for gemstones); defaults to the chosen size */
  size?: number
  /** Appended to the gallery's "Previewing" badge */
  previewNote?: string
  /** "preview": the live preview alone, sticky (2a). "full": every image, buy form sticky (2b). */
  gallery?: StoneGalleryMode
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
        {/* No breadcrumb in Test 2: the gallery starts 8px below the stepper, matching its side gutter. */}
        <div className={COLUMNS}>
          {/* Sticky column (below the sticky-on-intent header, --header-offset): the preview on 2a, so it's
              always on screen while the handles move; the buy form on 2b, beside the long gallery. */}
          <div
            className={cn(
              // 8px gutter; on desktop 2b, Test 1's long gallery brings its own (so it isn't doubled).
              "px-2 pt-2",
              gallery === "full" && "lg:px-0",
              gallery === "preview" && "transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset) lg:self-start lg:pb-8",
            )}
          >
            <StoneStepGallery
              type={prefs.type}
              shape={effectiveShape(prefs)}
              size={size ?? chosenSize(prefs)}
              gem={prefs.gem}
              previewNote={previewNote}
              mode={gallery}
            />
          </div>
          {/* Mobile: 24px between the gallery and the buy form. */}
          <aside className="px-margin pt-6 pb-8 lg:px-14 lg:pt-5">
            <div
              className={cn(
                "mx-auto flex max-w-xl flex-col gap-6 lg:mx-0 lg:max-w-none lg:gap-8",
                gallery === "full" && "transition-[top] duration-300 ease-out lg:sticky lg:top-[calc(var(--header-offset)+--spacing(5))]",
              )}
            >
              {children}
            </div>
          </aside>
        </div>
      </main>
      {/* Mobile: the site's bottom navigation bar, as on every other page (Test 2's PLP has it via the GLP). */}
      <MobileBottomNav />
    </div>
  )
}
