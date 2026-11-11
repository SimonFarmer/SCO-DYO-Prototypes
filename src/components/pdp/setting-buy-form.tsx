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
import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { METALS, descriptionFor, monthlyPayment, type MetalId, type Setting } from "@/data/products"
import { cn, formatPrice } from "@/lib/utils"

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
}

function MetalSelector({
  options,
  value,
  onChange,
}: {
  options: MetalId[]
  value: MetalId
  onChange: (m: MetalId) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="type-h4 font-medium text-primary">Select your Metal</h2>
      <div role="radiogroup" aria-label="Metal" className="flex flex-wrap gap-1.5">
        {options.map((id) => {
          const selected = id === value
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={METALS[id].label}
              onClick={() => onChange(id)}
              className={cn(
                "flex size-11 items-center rounded-full p-1.5",
                selected ? "border-w-300 border-primary" : "border border-border-subtle hover:border-primary",
              )}
            >
              <span className="block size-full rounded-full" style={{ backgroundColor: METALS[id].swatch }} />
            </button>
          )
        })}
      </div>
      <p className="text-sm leading-none font-semibold text-muted-foreground">{METALS[value].label}</p>
      <div className="flex flex-col gap-2 bg-bg-input-50 p-3">
        <Button variant="link" size="inline" className="w-fit">
          Learn about Metals
          <Info />
        </Button>
        <p className="type-caption text-primary">
          Compare {METALS[value].label.toLowerCase()} with our other metals, and how each one wears over time.
        </p>
      </div>
    </div>
  )
}

function FinancingCard({ price }: { price: number }) {
  return (
    <div className="flex items-start gap-3 bg-bg-input-50 p-3">
      {/* Figma: 52px tile, fill #5C0017 — no tokens; closest are size-12 and tertiary (signature-burgundy-900). */}
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xs bg-tertiary">
        <img src="/assets/misc/finance-badge.png" alt="Shane Co. credit card" className="aspect-[208/134] w-full rounded-xs object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">Financing Available</p>
          <p className="text-xs font-medium text-primary">
            {formatPrice(monthlyPayment(price))}/mo suggested payments with 12-month special financing.
          </p>
        </div>
        <Button variant="link" size="inline" className="w-fit">
          Learn More
        </Button>
      </div>
    </div>
  )
}

function BuyActions({ onSelect }: { onSelect?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onSelect}>
            Select this Setting
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More options" />}>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Out of scope for Test 1 — items are inert. */}
              <DropdownMenuItem disabled>Edit Ring Size</DropdownMenuItem>
              <DropdownMenuItem disabled>Review your design</DropdownMenuItem>
              <DropdownMenuItem disabled>Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="wide" className="flex-1">
            <HeartStraight />
            Save
          </Button>
          <Button variant="outline" size="wide" className="flex-1">
            <EnvelopeSimple />
            Drop a Hint
          </Button>
        </div>
      </div>
      <Button variant="link" size="inline" className="gap-2 py-2">
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

function DyoAssurances() {
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

function DeliveryOptions() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between bg-primary-foreground p-4">
        <p className="pt-1 type-label-xs font-semibold text-primary">Free &amp; fast shipping</p>
        <p className="type-h5 font-medium text-primary">By Tue, Nov 10</p>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 border-t border-muted bg-primary-foreground p-4 text-left"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="type-label-xs font-semibold text-primary">Need it sooner?</span>
          <span className="type-caption text-secondary-foreground">$10 faster shipping: by Sat, Nov 7</span>
        </span>
        <CaretDown className={cn("size-4 text-primary transition-transform", open && "rotate-180")} />
      </button>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
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
              <Button variant="link" size="inline">
                Price explained
                <Info />
              </Button>
            </div>
          </div>
          {teaser ? (
            // Figma 7342:118223 — two lines of the description, truncated with an ellipsis.
            <div className="flex flex-col gap-2">
              <p className="line-clamp-2 text-sm font-medium text-muted-foreground">{descriptionFor(setting, metal)}</p>
              <Button variant="link" size="inline" className="w-fit py-2" onClick={onViewDetails}>
                View full product details
              </Button>
            </div>
          ) : (
            <Button variant="link" size="inline" className="w-fit py-2" onClick={onViewDetails}>
              View product details
            </Button>
          )}
        </div>
        <Separator className="my-3 bg-muted" />
        <MetalSelector options={setting.variants.map((v) => v.metal)} value={metal} onChange={onMetalChange} />
        <Separator className="my-3 bg-muted" />
      </div>
      <FinancingCard price={variant.price} />
      <BuyActions onSelect={onSelect} />
      {afterActions}
      <DyoAssurances />
      {beforeDelivery}
      <DeliveryOptions />
    </div>
  )
}
