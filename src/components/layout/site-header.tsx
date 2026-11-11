import { useEffect, useRef, useState } from "react"
import { List } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const UTILITY_LEFT = [
  { label: "Search", icon: "/assets/header/icon-search.svg" },
  { label: "Care", icon: "/assets/header/icon-care.svg" },
  { label: "Greenwood Village", icon: "/assets/header/icon-location.svg" },
]

const UTILITY_RIGHT = [
  { label: "Sign In", icon: "/assets/header/icon-user.svg" },
  { label: "Wishlist", icon: "/assets/header/icon-heart.svg" },
]

const NAV = ["Engagement Rings", "Wedding Bands", "Diamonds", "Gemstones", "Fine Jewelry", "Personalize"]

function BagIcon() {
  // Figma composes the bag from two vector layers; positions mirror the source frame.
  return (
    <span className="relative block size-5" aria-hidden>
      <span className="absolute top-1/4 right-[16.67%] bottom-[16.66%] left-[16.67%]">
        <img src="/assets/header/icon-bag-body.svg" alt="" className="absolute inset-[-4.29%_-3.75%] block size-auto max-w-none" />
      </span>
      <span className="absolute inset-[10.96%_37.5%_64.04%_37.5%]">
        <img src="/assets/header/icon-bag-handle.svg" alt="" className="absolute inset-[-10%] block size-auto max-w-none" />
      </span>
    </span>
  )
}

function UtilityItem({ label, icon, className }: { label: string; icon?: string; className?: string }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className={cn("flex h-10 items-center gap-2 px-2.5 text-primary hover:underline", className)}
    >
      {icon ? <img src={icon} alt="" className="size-5" /> : <BagIcon />}
      <span className="hidden text-xxs leading-3 font-semibold tracking-[0.5px] lg:inline">{label}</span>
    </a>
  )
}

/**
 * Sticky-on-intent behaviour: the header hides while scrolling down and slides back in, complete,
 * as soon as the user scrolls up. It publishes its visible height as `--header-offset` on <html>
 * so other sticky elements (buy form, thumbnail gallery) can sit just below it.
 */
function useStickyOnIntent(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    let lastY = window.scrollY
    let shown = true
    let frame = 0

    const publish = () => root.style.setProperty("--header-offset", shown ? `${el.offsetHeight}px` : "0px")
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY
        if (Math.abs(delta) < 4) return // ignore jitter
        const next = y <= el.offsetHeight || delta < 0
        if (next !== shown) {
          shown = next
          setVisible(next)
          publish()
        }
        lastY = y
      })
    }

    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      root.style.removeProperty("--header-offset")
    }
  }, [ref])

  return visible
}

/** Global site header (Pattern Library "Header", desktop 1440). Sticky on intent. */
export function SiteHeader() {
  const ref = useRef<HTMLElement>(null)
  const visible = useStickyOnIntent(ref)
  return (
    <header
      ref={ref}
      data-visible={visible}
      className={cn(
        "sticky top-0 z-40 border-b border-muted bg-background transition-transform duration-300 ease-out",
        !visible && "-translate-y-full",
      )}
    >
      <div className="flex flex-col gap-4 px-margin pt-4 lg:pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-1">
            <button type="button" aria-label="Menu" className="flex size-10 items-center justify-center text-primary lg:hidden">
              <List className="size-5" />
            </button>
            {UTILITY_LEFT.map((item, i) => (
              <UtilityItem key={item.label} {...item} className={cn(i > 0 && "hidden lg:flex")} />
            ))}
          </div>
          <a href="/" className="flex flex-1 justify-center" aria-label="Shane Co. home">
            <img src="/assets/header/logo.svg" alt="Shane Co." className="h-8 w-auto lg:h-10" />
          </a>
          <div className="flex flex-1 items-center justify-end gap-1">
            {UTILITY_RIGHT.map((item) => (
              <UtilityItem key={item.label} {...item} className="hidden lg:flex" />
            ))}
            <UtilityItem label="Bag" />
          </div>
        </div>
        <nav aria-label="Primary" className="hidden justify-center lg:flex">
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex h-10 items-center px-2.5 type-label-s font-semibold text-primary hover:underline"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
