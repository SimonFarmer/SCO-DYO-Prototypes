import type { ReactNode } from "react"
import { useNavigate } from "react-router"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { NAV_PROMO, type NavGroup, type NavLink } from "@/data/plp"
import { cn } from "@/lib/utils"

/**
 * Opens a navigation link: in-prototype routes navigate (with a fresh scroll position);
 * anything else shows the "not part of this test" notice.
 */
export function useOpenNavLink(onNavigate?: () => void) {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  return (link: NavLink) => {
    if (!link.to) {
      notInTest(link.label)
      return
    }
    onNavigate?.()
    navigate(link.to)
    window.scrollTo({ top: 0 })
  }
}

export function NavTextLink({ link, onOpen, className }: { link: NavLink; onOpen: (l: NavLink) => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(link)}
      className={cn(
        "cursor-pointer text-left text-sm leading-5 text-primary hover:underline",
        link.icon && "flex items-center gap-2",
        className,
      )}
    >
      {link.icon && <img src={link.icon} alt="" className="size-7 shrink-0" />}
      {link.label}
    </button>
  )
}

/** A Level 2 group: Label XS heading, then links (one or two columns). Figma "Setting styles" / "Metal Types". */
export function NavLinkGroup({ group, onOpen, columnClass }: { group: NavGroup; onOpen: (l: NavLink) => void; columnClass?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="type-label-xs text-primary">{group.heading}</p>
      {/* Two-column groups fill down then across, as in Figma (Classic…Halo, then Swirl…Infinity). */}
      <ul className={cn("grid gap-x-6 gap-y-3", group.columns === 2 ? cn("grid-flow-col grid-cols-2 grid-rows-5", columnClass) : "grid-cols-1")}>
        {group.links.map((l) => (
          <li key={l.label}>
            <NavTextLink link={l} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** "Find the perfect ring with guidance from our experts" card (Figma Mega Menu Featured Content). */
export function NavPromo({ withImage = true, className, children }: { withImage?: boolean; className?: string; children?: ReactNode }) {
  const open = useOpenNavLink()
  return (
    <div className={cn("flex flex-col", className)}>
      {withImage && <img src={NAV_PROMO.image} alt="" className="aspect-video w-full object-cover object-[50%_85%]" />}
      <div className="flex flex-col gap-4 p-5">
        <p className="type-h5 text-primary">{NAV_PROMO.title}</p>
        <ul className="flex flex-col gap-3">
          {NAV_PROMO.links.map((label) => (
            <li key={label}>
              <NavTextLink link={{ label, to: null }} onOpen={open} />
            </li>
          ))}
        </ul>
        {children}
      </div>
    </div>
  )
}
