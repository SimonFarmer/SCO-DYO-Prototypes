import { useEffect, type ReactNode } from "react"
import { useLocation } from "react-router"
import { DyoStepper } from "@/components/dyo/dyo-stepper"
import { Breadcrumb } from "@/components/site/breadcrumb"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteHeader } from "@/components/site/site-header"
import type { StoneGalleryMode } from "@/components/stones/stone-step-gallery"
import { useFlow } from "@/flow/flow-context"
import { FLOW_CRUMBS } from "@/flow/flow-paths"
import { cn, PAGE_MAX } from "@/lib/utils"
import { FlowStoneGallery } from "./flow-stone-gallery"
import { chosenSize, effectiveShape, type StonePrefs } from "./simulator"

const COLUMNS = "grid lg:grid-cols-[826fr_606fr] lg:gap-2"

/**
 * Full DYO flow · stone step frame. A copy of Test 2's StoneStepLayout (src/pages/test-2/stone-step-layout.tsx)
 * with the flow's live header navigation, the flow breadcrumb (moderator switch), the mobile bottom bar and a
 * preview of the flow's own setting.
 */
export function FlowStoneStepLayout({
  prefs,
  size,
  previewNote,
  gallery = "preview",
  children,
}: {
  prefs: StonePrefs
  size?: number
  previewNote?: string
  gallery?: StoneGalleryMode
  children: ReactNode
}) {
  const flow = useFlow()
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader contained navigation />
      <DyoStepper current={2} mobileLabel="Stone" contained />
      <main className={PAGE_MAX}>
        {flow?.config.crumbs && (
          <div className={COLUMNS}>
            <Breadcrumb
              items={
                pathname.endsWith("/recommendations")
                  ? FLOW_CRUMBS.recommendations(`${pathname.replace(/\/recommendations$/, "")}${search}`)
                  : FLOW_CRUMBS.stone
              }
              className="mx-2 bg-secondary"
            />
          </div>
        )}
        <div className={COLUMNS}>
          <div
            className={cn(
              // With the breadcrumb, the gallery starts right under it (as on the Settings PDP); without it,
              // 8px below the stepper, matching the side gutter (Test 2).
              "px-2",
              !flow?.config.crumbs && "pt-2",
              gallery === "full" && "lg:px-0",
              gallery === "preview" && "transition-[top] duration-300 ease-out lg:sticky lg:top-(--header-offset) lg:self-start lg:pb-8",
            )}
          >
            {/* Previews the ring being built (Ella Cathedral in the build's metal), not Test 2's setting. */}
            <FlowStoneGallery shape={effectiveShape(prefs)} size={size ?? chosenSize(prefs)} previewNote={previewNote} mode={gallery} />
          </div>
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
      <MobileBottomNav />
    </div>
  )
}
