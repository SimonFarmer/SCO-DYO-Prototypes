import {
  DiamondIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  type Icon,
} from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"

const NAV = ["Engagement Rings", "Wedding Bands", "Diamonds", "Gemstones", "Fine Jewelry", "Personalize"]

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

/** Global site header (inert: outside every test's scope). */
export function SiteHeader() {
  const notInTest = useNotInTest()
  return (
    <header className="border-b border-border-subtle bg-background lg:border-b-0">
      {/* Mobile: logo + tagline, as on the non-DYO mobile PDP */}
      <div className="flex h-22 items-center justify-center lg:hidden">
        <button type="button" onClick={() => notInTest("The homepage")} className="cursor-pointer">
          <Logo withTagline />
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="relative flex h-22 items-center justify-between px-margin">
          <div className="flex items-center gap-6">
            <UtilityLink icon={MagnifyingGlassIcon} label="Search" />
            <UtilityLink icon={DiamondIcon} label="Care" />
            <UtilityLink icon={MapPinIcon} label="Greenwood Village" />
          </div>
          <button
            type="button"
            onClick={() => notInTest("The homepage")}
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
        <nav className="flex h-8 items-start justify-center gap-5">
          {NAV.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => notInTest("Site navigation")}
              className="cursor-pointer type-label-s text-primary"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
