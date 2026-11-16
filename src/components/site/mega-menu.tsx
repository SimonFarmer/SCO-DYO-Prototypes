import { useState } from "react"
import { CaretRightIcon } from "@phosphor-icons/react"
import { NAV_SECTIONS, NAV_TOP_LINKS } from "@/data/plp"
import { cn } from "@/lib/utils"
import { NavLinkGroup, NavPromo, NavTextLink, useOpenNavLink } from "./nav-links"

/**
 * Engagement Rings mega menu, desktop (Figma "Desktop - Engagement Ring_Active Nav", 7845:197892).
 * Shop by Look is active whenever the menu opens. Hovering a Level 2 row (Shop by Stone…) swaps the
 * right-hand panel; hovering the top links (Ring Finder Quiz, Shop All, Design Your Own) does not.
 */
export function MegaMenu({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(NAV_SECTIONS[0].id)
  const open = useOpenNavLink(onClose)
  const section = NAV_SECTIONS.find((s) => s.id === active)!

  return (
    <div className="absolute inset-x-0 top-full z-40 flex border-t border-border-subtle bg-secondary shadow-lg animate-in fade-in">
      {/* Level 2 column */}
      <div className="flex w-97.5 shrink-0 flex-col bg-background pt-10 pb-12">
        <ul className="flex flex-col gap-3 px-margin">
          {NAV_TOP_LINKS.map((l) => (
            <li key={l.label}>
              <NavTextLink link={l} onOpen={open} />
            </li>
          ))}
        </ul>
        <ul className="mt-12 flex flex-col">
          {NAV_SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(s.id)}
                onFocus={() => setActive(s.id)}
                onClick={() => setActive(s.id)}
                aria-expanded={active === s.id}
                className={cn(
                  "flex h-14 w-full cursor-pointer items-center justify-between px-margin text-left font-heading text-2xl leading-8 text-primary",
                  active === s.id && "bg-secondary",
                )}
              >
                {s.label}
                <CaretRightIcon className="size-5" weight="light" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Level 2 content */}
      <div className="flex min-w-0 flex-1 justify-between gap-8 py-10 pr-margin pl-8">
        <div key={section.id} className="flex w-161 flex-col gap-14 animate-in fade-in">
          {section.groups.map((g) => (
            <NavLinkGroup key={g.heading} group={g} onOpen={open} columnClass="gap-x-0 [&>li]:w-80.5" />
          ))}
        </div>
        <NavPromo className="w-card shrink-0 self-start bg-background" />
      </div>
    </div>
  )
}
