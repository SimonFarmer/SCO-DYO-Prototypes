import { useEffect, useState, type RefObject } from "react"
import { Link } from "react-router"
import {
  CaretLeftIcon,
  CaretRightIcon,
  DiamondIcon,
  HeartIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserCircleIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { useFlow, useFlowPath } from "@/flow/flow-context"
import { Button } from "@/components/ui/button"
import { NAV_LEVEL_1, NAV_SECTIONS, NAV_TOP_LINKS, STORE } from "@/data/plp"
import { cn } from "@/lib/utils"
import { NavLinkGroup, NavPromo, NavTextLink, useOpenNavLink } from "./nav-links"

type Screen = { level: 1 } | { level: 2 } | { level: 3; section: string }

const TABS: { label: string; icon: Icon }[] = [
  { label: "Search", icon: MagnifyingGlassIcon },
  { label: "Bag", icon: ShoppingBagIcon },
  { label: "Care", icon: DiamondIcon },
  { label: "Account", icon: UserCircleIcon },
]

/** Header row of a menu screen: back (Level 2+), centred logo or title, close. */
function ScreenHeader({ title, onBack, onClose }: { title?: string; onBack?: () => void; onClose: () => void }) {
  const flow = useFlow()
  const flowPath = useFlowPath()
  return (
    <div className="grid h-22 shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center px-4">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Back" className="flex size-10 cursor-pointer items-center justify-center text-primary">
          <CaretLeftIcon className="size-5" weight="light" />
        </button>
      ) : (
        <span />
      )}
      {title ? (
        <h2 className="text-center type-h4 font-medium text-primary">{title}</h2>
      ) : (
        <Link
          to={flowPath("/")}
          // In the flow the logo is site navigation too, so it goes through the exit guard.
          onClick={flow ? (e) => (e.preventDefault(), onClose(), flow.leave("/")) : undefined}
          aria-label="Shane Co. (back to the prototype list)"
          className="mx-auto"
        >
          <img src="/images/logo.svg" alt="" className="h-10 w-auto" />
        </Link>
      )}
      <button type="button" onClick={onClose} aria-label="Close menu" className="flex size-10 cursor-pointer items-center justify-center text-primary">
        <XIcon className="size-6" weight="light" />
      </button>
    </div>
  )
}

/** Shop tab: opens the full-screen menu; underlined while it is open. */
function ShopToggle({ open, onClick, className }: { open: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className={cn("relative flex cursor-pointer flex-col items-center justify-center gap-1.5 type-label-xs text-primary", className)}
    >
      <ListIcon className="size-5" weight="light" />
      Shop
      {open && <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 bg-primary" />}
    </button>
  )
}

/** Large Playfair row with a chevron (Level 1 categories, Level 2 sections). */
function DrillRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li className="border-b border-muted last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className="flex h-14 w-full cursor-pointer items-center justify-between text-left font-heading text-2xl leading-8 text-primary"
      >
        {label}
        <CaretRightIcon className="size-4" weight="light" />
      </button>
    </li>
  )
}

/**
 * Mobile navigation (Figma 7845:197904 → 197911 → 197914 → 197917): a fixed bottom bar; Shop opens
 * a full-screen menu that drills Level 1 → Engagement Rings → Shop by Look/Stone/Budget/Featured.
 * Renders its own spacer so page content clears the fixed bar.
 */
export interface BottomNavCta {
  /** e.g. "$2,225 - Select this Setting" */
  label: string
  onClick: () => void
  /** The page's own CTA; the bar swaps to `label` once it has scrolled out the top of the viewport. */
  watch: RefObject<HTMLElement | null>
}

/** True once `ref`'s element has scrolled out the top of the viewport. */
function useScrolledPast(ref: RefObject<HTMLElement | null> | undefined) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const el = ref?.current
    if (!el) return
    const update = () => setPast(el.getBoundingClientRect().bottom <= 0)
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [ref])
  return past
}

export function MobileBottomNav({
  cta,
  shopInTest = true,
}: {
  cta?: BottomNavCta
  /** false: Shop shows the "not part of this test" notice instead of opening the menu (e.g. Test 1) */
  shopInTest?: boolean
}) {
  const notInTest = useNotInTest()
  const showCta = useScrolledPast(cta?.watch)
  const [screen, setScreen] = useState<Screen | null>(null)
  const close = () => setScreen(null)
  const open = useOpenNavLink(close)

  // Lock the page behind the open menu.
  useEffect(() => {
    if (!screen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [screen])

  const section = screen?.level === 3 ? NAV_SECTIONS.find((s) => s.id === screen.section) : undefined

  return (
    <>
      <div aria-hidden className="h-17 lg:hidden" />

      {screen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shop menu"
          className="fixed inset-x-0 top-0 bottom-17 z-50 flex flex-col overflow-y-auto bg-background animate-in fade-in lg:hidden"
        >
          {screen.level === 1 && (
            <>
              <ScreenHeader onClose={close} />
              <ul className="flex flex-col px-6">
                {[...NAV_LEVEL_1, "Support"].map((item) => (
                  <DrillRow
                    key={item}
                    label={item}
                    onClick={() => (item === "Engagement Rings" ? setScreen({ level: 2 }) : notInTest(item))}
                  />
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-6 bg-secondary px-6 py-8">
                {[
                  { label: STORE.region, icon: MapPinIcon },
                  { label: "Track Order", icon: TruckIcon },
                  { label: "Wish List", icon: HeartIcon },
                ].map(({ label, icon: IconCmp }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => notInTest(label)}
                    className="flex cursor-pointer items-center gap-1 type-label-xs text-primary underline"
                  >
                    <IconCmp className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {screen.level === 2 && (
            <>
              <ScreenHeader title="Engagement Rings" onBack={() => setScreen({ level: 1 })} onClose={close} />
              <div className="flex flex-col gap-8 px-6 pt-2 pb-8">
                <ul className="flex flex-col gap-3">
                  {NAV_TOP_LINKS.map((l) => (
                    <li key={l.label}>
                      <NavTextLink link={l} onOpen={open} />
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col">
                  {NAV_SECTIONS.map((s) => (
                    <DrillRow key={s.id} label={s.label} onClick={() => setScreen({ level: 3, section: s.id })} />
                  ))}
                </ul>
              </div>
            </>
          )}

          {section && (
            <>
              <ScreenHeader title={section.label} onBack={() => setScreen({ level: 2 })} onClose={close} />
              <div className="flex flex-col gap-12 px-6 pt-2 pb-8">
                {section.groups.map((g) => (
                  <NavLinkGroup key={g.heading} group={g} onOpen={open} />
                ))}
                <NavPromo withImage={false} className="bg-secondary px-1" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Fixed bottom bar (Figma "Mobile - Homepage_Fixed Bottom Nav"). With a `cta`, the navigation
          slides up and the CTA bar slides in once the page CTA has scrolled out the top (Lewis Braid's
          sticky ATB swap prototype); reduced motion dissolves instead of sliding. */}
      <div className="fixed inset-x-0 bottom-0 z-50 h-17 overflow-hidden border-t border-border-subtle bg-background lg:hidden">
        <nav
          aria-label="Mobile"
          inert={showCta && !screen}
          className={cn(
            "absolute inset-0 grid grid-cols-5 px-2 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-opacity",
            showCta && !screen && "-translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0",
          )}
        >
          {TABS.map(({ label, icon: IconCmp }) => (
            <button
              key={label}
              type="button"
              onClick={() => notInTest(label)}
              className={cn("flex cursor-pointer flex-col items-center justify-center gap-1.5 type-label-xs text-primary", screen && "text-muted-foreground")}
            >
              <IconCmp className="size-5" weight="light" />
              {label}
            </button>
          ))}
          <ShopToggle open={!!screen} onClick={shopInTest ? () => setScreen((s) => (s ? null : { level: 1 })) : () => notInTest("Shop menu")} />
        </nav>
        {cta && (
          <div
            role="region"
            aria-label={cta.label}
            inert={!showCta || !!screen}
            className={cn(
              "absolute inset-0 flex items-center gap-6 pr-6 pl-margin transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-opacity",
              !(showCta && !screen) && "translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0",
            )}
          >
            <Button className="flex-1" onClick={cta.onClick}>
              {cta.label}
            </Button>
            <ShopToggle open={false} onClick={shopInTest ? () => setScreen({ level: 1 }) : () => notInTest("Shop menu")} className="w-10" />
          </div>
        )}
      </div>
    </>
  )
}
