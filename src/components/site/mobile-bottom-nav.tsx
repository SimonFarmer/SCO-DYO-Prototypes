import { useEffect, useState } from "react"
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
        <img src="/images/logo.svg" alt="Shane Co." className="mx-auto h-10 w-auto" />
      )}
      <button type="button" onClick={onClose} aria-label="Close menu" className="flex size-10 cursor-pointer items-center justify-center text-primary">
        <XIcon className="size-6" weight="light" />
      </button>
    </div>
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
export function MobileBottomNav() {
  const notInTest = useNotInTest()
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

      {/* Fixed bottom bar (Figma "Mobile - Homepage_Fixed Bottom Nav") */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-50 grid h-17 grid-cols-5 border-t border-border-subtle bg-background px-2 lg:hidden"
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
        <button
          type="button"
          aria-expanded={!!screen}
          onClick={() => setScreen((s) => (s ? null : { level: 1 }))}
          className="relative flex cursor-pointer flex-col items-center justify-center gap-1.5 type-label-xs text-primary"
        >
          <ListIcon className="size-5" weight="light" />
          Shop
          {screen && <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 bg-primary" />}
        </button>
      </nav>
    </>
  )
}
