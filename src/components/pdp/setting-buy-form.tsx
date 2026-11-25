import {
  ArrowsClockwise,
  ArrowsOutLineVertical,
  CaretDown,
  CaretRight,
  CheckCircle,
  EnvelopeSimple,
  HeartStraight,
  Info,
  ShieldCheck,
} from "@phosphor-icons/react"
import { EllipsisVertical, MessageCircle } from "lucide-react"
import { useState, type ReactNode, type Ref } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { METALS, descriptionFor, type MetalId, type Setting } from "@/data/products"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useNotInTest } from "@/components/prototype/not-in-test"

interface SettingBuyFormProps {
  setting: Setting
  metal: MetalId
  onMetalChange: (metal: MetalId) => void
  onViewDetails?: () => void
  onSelect?: () => void
  /** Show a 2-line description teaser above the details link (Test 1 variant B) */
  teaser?: boolean
  /** Rendered after the CTAs, e.g. "Complete the Look" (variant C) */
  afterActions?: ReactNode
  /** Rendered between assurances and delivery, e.g. inline details tabs (variant C) */
  beforeDelivery?: ReactNode
  /** Main CTA row — the mobile bottom bar swaps to the CTA once this scrolls out of view. */
  ctaRef?: Ref<HTMLDivElement>
}

/**
 * Figma SCO Drop 3a – PDP 2871:35830 (selected) / 2871:35770 (hover):
 * default = 1px border-subtle, hover = 1px border, selected = 2px primary.
 * On hover the label row shows the hovered metal with its price.
 */
export function MetalSelector({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: { metal: MetalId; price: number }[]
  value: MetalId
  onChange: (m: MetalId) => void
  /**
   * The accordion flow's panel (Figma 8224:180625): an H5 title with the metal beside it, and no metal line or
   * "Learn about Metals" box under the swatches. Off by default (Test 1's buy form).
   */
  compact?: boolean
}) {
  const notInTest = useNotInTest()
  const [hovered, setHovered] = useState<MetalId | null>(null)
  const hoveredOption = options.find((o) => o.metal === hovered)
  return (
    <div className={cn("flex flex-col", compact ? "gap-4" : "gap-6")}>
      {compact ? (
        <div className="flex items-baseline justify-between gap-4 text-primary">
          <h2 className="type-h5">Select your Metal</h2>
          <p aria-live="polite" className="text-right text-xs leading-4 font-semibold whitespace-nowrap">
            {METALS[hoveredOption?.metal ?? value].label}
            {hoveredOption && <span className="ml-2 font-medium">{formatPrice(hoveredOption.price)}</span>}
          </p>
        </div>
      ) : (
        <h2 className="type-h4 font-medium text-primary">Select your Metal</h2>
      )}
      <div role="radiogroup" aria-label="Metal" className="flex flex-wrap gap-1.5" onMouseLeave={() => setHovered(null)}>
        {options.map(({ metal: id }) => {
          const selected = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={METALS[id].label}
              onClick={() => onChange(id)}
              onMouseEnter={() => setHovered(id)}
              className={cn(
                "flex size-11 items-center rounded-full p-1.5",
                selected ? "border-w-300 border-primary" : "border border-border-subtle hover:border-border",
              )}
            >
              <span className="block size-full rounded-full" style={{ backgroundColor: METALS[id].swatch }} />
            </button>
          )
        })}
      </div>
      {!compact && (
        <>
      <p className="flex items-center gap-2 text-sm leading-none">
        <span className="font-semibold text-muted-foreground">{METALS[hoveredOption?.metal ?? value].label}</span>
        {hoveredOption && <span className="font-medium text-primary">{formatPrice(hoveredOption.price)}</span>}
      </p>
      <div className="flex flex-col gap-2 bg-bg-input-50 p-3">
        <Button variant="link" className="h-auto gap-0.5 px-0 w-fit" onClick={() => notInTest("Metal education")}>
          Learn about Metals
          <Info />
        </Button>
        <p className="type-caption text-primary">
          Compare {METALS[value].label.toLowerCase()} with our other metals, and how each one wears over time.
        </p>
      </div>
        </>
      )}
    </div>
  )
}

/** “Price explained” popover on the Settings PDP — opens on hover, click/tap still works (Figma 7342:118262). */
export function PriceExplained({ price }: { price: number }) {
  const rows = [
    { label: "Setting, incl. accent stones", value: formatPrice(price) },
    { label: "Center stone", value: "Chosen in step 2" },
  ]
  return (
    <Popover>
      <PopoverTrigger openOnHover delay={100} render={<Button variant="link" className="h-auto gap-0.5 px-0" />}>
        Price explained
        <Info />
      </PopoverTrigger>
      {/* Figma: 302px wide, left-aligned under the price row — closest width token is w-80 (320px). */}
      <PopoverContent align="start" className="flex w-80 flex-col gap-2 text-xs leading-4 text-muted-foreground">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-2">
            <p>{row.label}</p>
            <p className="font-semibold">{row.value}</p>
          </div>
        ))}
        <p>Your ring total updates once you choose a center stone.</p>
      </PopoverContent>
    </Popover>
  )
}

function BuyActions({ onSelect, ctaRef }: { onSelect?: () => void; ctaRef?: Ref<HTMLDivElement> }) {
  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <div ref={ctaRef} className="flex gap-2">
          <Button className="flex-1" onClick={onSelect ?? (() => notInTest("Selecting the setting"))}>
            Select this Setting
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More options" />}>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* The only option that applies at the setting step; out of scope for Test 1. */}
              <DropdownMenuItem onClick={() => notInTest("Adding the setting to your bag")}>
                Add Setting Only to Bag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="px-6 flex-1" onClick={() => notInTest("Saving")}>
            <HeartStraight />
            Save
          </Button>
          <Button variant="outline" className="px-6 flex-1" onClick={() => notInTest("Drop a hint")}>
            <EnvelopeSimple />
            Drop a Hint
          </Button>
        </div>
      </div>
      <Button variant="link" className="h-auto gap-2 px-0 py-2" onClick={() => notInTest("Chat")}>
        <MessageCircle />
        Chat with a Jewelry Consultant
      </Button>
    </div>
  )
}

const ASSURANCES = [
  { icon: ArrowsClockwise, lines: ["Free shipping", "& returns"] },
  { icon: ShieldCheck, lines: ["Free lifetime", "warranty"] },
  { icon: CheckCircle, lines: ["Lifetime diamond", "upgrade"] },
  { icon: ArrowsOutLineVertical, lines: ["Free ring", "resizing"] },
]

/** "We’ve got you covered" tiles — shared by the setting and diamond buy forms. */
export function DyoAssurances() {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-label-xs font-semibold text-primary">We’ve got you covered</p>
      <ul className="grid grid-cols-2 gap-1">
        {ASSURANCES.map(({ icon: Icon, lines }) => (
          <li key={lines[0]} className="flex flex-col items-center justify-center gap-2 bg-secondary p-4">
            <Icon className="size-4 text-primary" />
            <p className="text-center type-label-xs font-semibold text-primary">
              {lines[0]}
              <br />
              {lines[1]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Shipping / faster delivery / store pickup rows — shared by the setting and diamond buy forms. */
export function DeliveryOptions() {
  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between bg-primary-foreground p-4">
        <p className="pt-1 type-label-xs font-semibold text-primary">Free &amp; fast shipping</p>
        <p className="type-h5 font-medium text-primary">By Tue, Nov 10</p>
      </div>
      <button
        type="button"
        onClick={() => notInTest("Faster shipping")}
        className="flex items-center gap-3 border-t border-muted bg-primary-foreground p-4 text-left"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="type-label-xs font-semibold text-primary">Need it sooner?</span>
          <span className="type-caption text-secondary-foreground">$10 faster shipping: by Sat, Nov 7</span>
        </span>
        <CaretDown className="size-4 text-primary" />
      </button>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          notInTest("Store pickup")
        }}
        className="flex items-start gap-3 border-t border-muted bg-white p-4"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="type-label-xs font-semibold text-primary">Pick up in store</span>
          <span className="flex gap-1 text-xs font-medium">
            <span className="tracking-[0.12px] text-primary underline">Greenwood Village</span>
            <span className="text-primary">-</span>
            <span className="text-muted-foreground">Check availability</span>
          </span>
        </span>
        <CaretRight className="size-4 self-center text-primary" />
      </a>
    </div>
  )
}

/** Right-hand column of the Settings PDP: product info, metal, price, CTAs, assurances, delivery. */
export function SettingBuyForm({
  setting,
  metal,
  onMetalChange,
  onViewDetails,
  onSelect,
  teaser = false,
  afterActions,
  beforeDelivery,
  ctaRef,
}: SettingBuyFormProps) {
  const variant = setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <p className="type-label-xs font-semibold text-muted-foreground">Step 1 of 3 · Select your setting</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="type-h2 font-medium text-primary">{setting.name}</h1>
            <p className="text-sm leading-none font-medium text-muted-foreground">{METALS[metal].label}</p>
            <p className="text-sm leading-none font-medium text-muted-foreground">Article No. {variant.articleNo}</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-primary">{formatPrice(variant.price)}</span>
                <span className="type-label-xs font-medium text-muted-foreground">Setting only</span>
              </span>
              <span className="text-sm leading-none font-medium text-muted-foreground" aria-hidden>
                ∙
              </span>
              <PriceExplained price={variant.price} />
            </div>
          </div>
          {teaser ? (
            // Figma 7342:118223 — two lines of the description, truncated with an ellipsis.
            <div className="flex flex-col gap-2">
              <p className="line-clamp-2 text-sm font-medium text-muted-foreground">{descriptionFor(setting, metal)}</p>
              <Button variant="link" className="h-auto gap-0.5 px-0 w-fit py-2" onClick={onViewDetails}>
                View full product details
              </Button>
            </div>
          ) : (
            <Button variant="link" className="h-auto gap-0.5 px-0 w-fit py-2" onClick={onViewDetails}>
              View product details
            </Button>
          )}
        </div>
        <Separator className="my-3 bg-muted" />
        <MetalSelector options={setting.variants.map((v) => ({ metal: v.metal, price: v.price }))} value={metal} onChange={onMetalChange} />
        <Separator className="my-3 bg-muted" />
      </div>
      {/* Financing is hidden until the ring is complete (fixes sheet, Settings PDP #12). */}
      <BuyActions onSelect={onSelect} ctaRef={ctaRef} />
      {afterActions}
      <DyoAssurances />
      {beforeDelivery}
      <DeliveryOptions />
    </div>
  )
}
