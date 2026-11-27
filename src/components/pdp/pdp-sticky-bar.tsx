import { Fragment, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react"
import { useFlow } from "@/flow/flow-context"
import { cn } from "@/lib/utils"

interface PdpStickyBarProps {
  image: string
  imageAlt: string
  title: string
  /** Short specs under the title, joined with “∙” (e.g. metal, carat). */
  specs: string[]
  /** Desktop only; left out on the mobile-only bars. */
  price?: string
  /** “View Gallery”: back to the gallery at the top of the page. */
  onViewGallery?: () => void
  /** Desktop: the bar shows once the top of this section reaches the top of the viewport. Without it, mobile only. */
  showFrom?: RefObject<HTMLElement | null>
  /**
   * Full flows, mobile: the section right after the gallery (the buy form). The bar shows once it reaches
   * the bar's place, i.e. once the gallery has scrolled away. Without it (or outside the flows) the bar is desktop only.
   */
  mobileFrom?: RefObject<HTMLElement | null>
  /** Full flows, mobile: the gallery itself. The bar shows once its bottom passes the bar's place (instead of `mobileFrom`). */
  mobileAfter?: RefObject<HTMLElement | null>
}

/**
 * Sticky product bar (Figma SCO Drop 3a – PDP, “Sticky Add to Bag” 2408:28961). Desktop; in the full flows
 * also on mobile (`mobileFrom`), under the sticky stepper bar, without the price.
 * Slides in once the shopper scrolls down to the `showFrom` section (“About this setting/diamond”) and sits just below the sticky-on-intent
 * site header (--header-offset). Publishes its visible height as `--sticky-bar-offset` so other
 * sticky elements (gallery, buy form) can stay clear of it.
 */
export function PdpStickyBar({ image, imageAlt, title, specs, price, onViewGallery, showFrom, mobileFrom, mobileAfter }: PdpStickyBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const mobile = !!useFlow() && !!(mobileFrom || mobileAfter)
  // Mobile: height of the sticky stepper bar the bar sits under.
  const [stepperHeight, setStepperHeight] = useState(0)

  useEffect(() => {
    const root = document.documentElement
    const desktop = window.matchMedia("(min-width: 80rem)" /* lg */)
    let current = false
    const update = () => {
      let next: boolean
      if (desktop.matches) {
        const section = showFrom?.current
        next = !!section && section.getBoundingClientRect().top <= 0
      } else {
        const stepper = document.querySelector<HTMLElement>('[data-slot="stepper-bar"]')?.offsetHeight ?? 0
        setStepperHeight(stepper)
        const header = parseFloat(getComputedStyle(root).getPropertyValue("--header-offset")) || 0
        const after = mobile ? mobileFrom?.current : null
        const gallery = mobile ? mobileAfter?.current : null
        next = after ? after.getBoundingClientRect().top <= header + stepper : !!gallery && gallery.getBoundingClientRect().bottom <= header + stepper
      }
      if (next !== current) {
        current = next
        setShown(next)
      }
      // Only the desktop sticky gallery and buy form read this.
      root.style.setProperty("--sticky-bar-offset", next && desktop.matches && ref.current ? `${ref.current.offsetHeight}px` : "0px")
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      root.style.removeProperty("--sticky-bar-offset")
    }
  }, [showFrom, mobileFrom, mobileAfter, mobile])

  const viewGallery =
    onViewGallery ??
    (() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })

  return (
    <div
      ref={ref}
      data-slot="pdp-sticky-bar"
      aria-hidden={!shown}
      inert={!shown}
      style={mobile ? ({ "--stepper-height": `${stepperHeight}px` } as CSSProperties) : undefined}
      className={cn(
        "fixed inset-x-0 z-20 hidden items-center justify-between gap-4 bg-background px-page py-2 shadow-md transition-[top,translate,opacity] duration-300 ease-out lg:top-(--header-offset) lg:flex",
        mobile && "top-[calc(var(--header-offset)+var(--stepper-height))] flex px-margin",
        !shown && "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="size-16 shrink-0 bg-secondary">
          <img src={image} alt={imageAlt} className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 self-stretch">
          <div className="flex flex-col gap-1.5">
            <p className="truncate text-base leading-none font-semibold text-primary">{title}</p>
            <p className="flex flex-wrap gap-x-1 gap-y-0.5 text-xs leading-none font-medium text-muted-foreground">
              {specs.map((spec, i) => (
                <Fragment key={spec}>
                  {i > 0 && <span aria-hidden>∙</span>}
                  <span>{spec}</span>
                </Fragment>
              ))}
            </p>
          </div>
          <button
            type="button"
            onClick={viewGallery}
            className="w-fit cursor-pointer text-xs leading-none font-semibold text-muted-foreground underline"
          >
            View Gallery
          </button>
        </div>
      </div>
      {price && <p className="shrink-0 text-lg leading-[1.2] font-semibold tracking-tight text-primary max-lg:hidden">{price}</p>}
    </div>
  )
}
