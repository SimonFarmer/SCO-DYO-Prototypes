import {
  DiamondIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  type Icon,
} from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { MegaMenu } from "@/components/site/mega-menu"
import { useStickyOnIntent } from "@/components/site/use-sticky-on-intent"
import { cn, PAGE_MAX } from "@/lib/utils"

import { NAV_LEVEL_1, PLP_PATH, STORE } from "@/data/plp"

function Logo({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <img src="/images/logo.svg" alt="Shane Co." className="h-10 w-auto" />
      {withTagline && <img src="/images/tagline.svg" alt="Your friend & jeweler" className="h-2 w-auto" />}
    </span>
  )
}

function UtilityLink({ icon: IconCmp, label }: { icon: Icon; label: string }) {
  const notInTest = useNotInTest()
  return (
    <button
      type="button"
      onClick={() => notInTest(label)}
      className="flex cursor-pointer items-center gap-2 text-xxs leading-3 font-semibold text-primary"
    >
      <IconCmp className="size-5" weight="light" />
      {label}
    </button>
  )
}

/**
 * Global site header. Sticky on intent: hides on scroll down, returns on scroll up.
 * In the tests it's inert. With `navigation` (the PLP entry point), Engagement Rings opens the
 * desktop mega menu on hover and goes to the PLP on click; on mobile, navigation lives in MobileBottomNav.
 */
export function SiteHeader({
  navigation = false,
  mobileHidden = false,
  contained = false,
}: {
  navigation?: boolean
  /** Cap the header's contents at the page max width (1680px); the bar itself stays full width. */
  contained?: boolean
  /** Hide the mobile logo bar (the homepage overlays its own logo on the hero). */
  mobileHidden?: boolean
}) {
  const notInTest = useNotInTest()
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const visible = useStickyOnIntent(ref)
  const [menuOpen, setMenuOpen] = useState(false)
  // Prototype-only: the logo returns to the index of prototypes (not the storefront homepage).
  const toIndex = () => {
    navigate("/")
    window.scrollTo({ top: 0 })
  }
  const closeTimer = useRef<number | undefined>(undefined)

  const openMenu = () => {
    window.clearTimeout(closeTimer.current)
    setMenuOpen(true)
  }
  // A short delay so moving the pointer from the nav item into the panel doesn't flicker it closed.
  const closeMenu = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setMenuOpen(false), 150)
  }
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])
  // The menu closes when the header slides away.
  if (!visible && menuOpen) setMenuOpen(false)
  return (
    <>
    <header
      ref={ref}
      data-visible={visible}
      className={cn(
        "sticky top-0 z-40 border-b border-border-subtle bg-background transition-transform duration-300 ease-out lg:border-b-0",
        mobileHidden && "max-lg:hidden",
        !visible && "-translate-y-full",
      )}
    >
      {/* Mobile: logo + tagline, as on the non-DYO mobile PDP */}
      <div className="flex h-22 items-center justify-center lg:hidden">
        <button type="button" onClick={toIndex} aria-label="Shane Co. (back to the prototype list)" className="cursor-pointer">
          <Logo withTagline />
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className={cn("relative flex h-22 items-center justify-between px-margin", contained && PAGE_MAX)}>
          <div className="flex items-center gap-6">
            <UtilityLink icon={MagnifyingGlassIcon} label="Search" />
            <UtilityLink icon={DiamondIcon} label="Care" />
            <UtilityLink icon={MapPinIcon} label={STORE.name} />
          </div>
          <button
            type="button"
            onClick={toIndex}
            aria-label="Shane Co. (back to the prototype list)"
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          >
            <Logo />
          </button>
          <div className="flex items-center gap-6">
            <UtilityLink icon={UserCircleIcon} label="Sign In" />
            <UtilityLink icon={HeartIcon} label="Wishlist" />
            <UtilityLink icon={ShoppingBagIcon} label="Bag" />
          </div>
        </div>
        <div className="relative" onMouseLeave={navigation ? closeMenu : undefined}>
          <nav className="flex h-8 items-start justify-center gap-5">
            {NAV_LEVEL_1.map((item) => {
              const live = navigation && item === "Engagement Rings"
              return (
                <button
                  key={item}
                  type="button"
                  aria-expanded={live ? menuOpen : undefined}
                  aria-haspopup={live ? "true" : undefined}
                  onMouseEnter={live ? openMenu : navigation ? closeMenu : undefined}
                  onFocus={live ? openMenu : undefined}
                  onClick={() => {
                    if (!live) return notInTest(navigation ? item : "Site navigation")
                    setMenuOpen(false)
                    navigate(PLP_PATH)
                    window.scrollTo({ top: 0 })
                  }}
                  className={cn(
                    "relative h-full cursor-pointer type-label-s text-primary",
                    live && menuOpen && "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
                  )}
                >
                  {item}
                </button>
              )
            })}
          </nav>
          {menuOpen && (
            <div onMouseEnter={openMenu}>
              <MegaMenu onClose={() => setMenuOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
    {/* Dims the page under the open mega menu (Figma active nav). */}
    {menuOpen && (
      <div
        aria-hidden
        onMouseEnter={closeMenu}
        className="fixed inset-0 z-30 hidden bg-black/40 animate-in fade-in lg:block"
      />
    )}
    </>
  )
}
