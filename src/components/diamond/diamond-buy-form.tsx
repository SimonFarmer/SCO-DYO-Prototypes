import { EnvelopeSimpleIcon, HeartStraightIcon, InfoIcon } from "@phosphor-icons/react"
import { EllipsisVertical, MessageCircle } from "lucide-react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { SpecList, SpecTiles, type SpecLayout } from "@/components/diamond/diamond-specs"
import { DeliveryOptions, DyoAssurances } from "@/components/pdp/setting-buy-form"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { diamondName, diamondTitle, type Diamond } from "@/data/diamonds"
import { formatPrice } from "@/lib/format"
import { useRingBuild } from "@/state/ring-build"

/** “Price explained” popover: setting + this stone = ring total (Figma 7336:167016). */
function PriceExplained({ diamond }: { diamond: Diamond }) {
  const { setting } = useRingBuild()
  const rows = [
    { label: "Setting", name: setting.name, price: setting.price },
    { label: "Stone", name: diamondTitle(diamond).replace(" ct ", " ct Brilliant "), price: diamond.price },
  ]
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="link" className="h-auto px-0 gap-0.5" />}>
        Price explained
        <InfoIcon />
      </PopoverTrigger>
      {/* Figma: 302px wide — closest width token is w-80 (320px). */}
      <PopoverContent className="flex w-80 flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.75">
            <p className="type-label-xs font-semibold text-primary">{row.label}</p>
            <div className="flex items-start gap-2 text-xs">
              <p className="flex-1 tracking-[0.12px] text-muted-foreground">{row.name}</p>
              <p className="font-semibold text-primary">{formatPrice(row.price)}</p>
            </div>
          </div>
        ))}
        <Separator className="bg-muted" />
        <div className="flex items-start gap-2 text-sm font-semibold text-primary">
          <p className="flex-1">Ring Total:</p>
          <p>{formatPrice(setting.price + diamond.price)}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface DiamondBuyFormProps {
  diamond: Diamond
  /** Spec layout under “Diamond Quality” — Test 3.2 compares tiles (A) and a list (B). */
  specLayout: SpecLayout
  onSelect: () => void
  onViewDetails: () => void
}

/** Right-hand column of the Diamond PDP (Figma 7375:134824 list / 7375:129294 tiles). */
export function DiamondBuyForm({ diamond, specLayout, onSelect, onViewDetails }: DiamondBuyFormProps) {
  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="type-h2 font-medium text-primary">{diamondName(diamond)}</h1>
            <p className="text-sm leading-none font-medium text-muted-foreground">Serial No. {diamond.serial}</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-primary">{formatPrice(diamond.price)}</span>
                <span className="type-label-xs font-medium text-muted-foreground">Diamond only price</span>
              </span>
              <span className="text-sm leading-none font-medium text-muted-foreground" aria-hidden>
                ∙
              </span>
              <PriceExplained diamond={diamond} />
            </div>
          </div>
          <Button variant="link" className="h-auto px-0 w-fit py-2" onClick={onViewDetails}>
            View product details
          </Button>
        </div>
        <Separator className="my-3 bg-muted" />
        <section className="flex flex-col gap-6" aria-labelledby="diamond-quality">
          <h2 id="diamond-quality" className="type-h4 font-medium text-primary">
            Diamond Quality
          </h2>
          <div className="flex flex-col gap-4">
            {specLayout === "tiles" ? (
              <SpecTiles diamond={diamond} order={["carat", "clarity", "color", "cut"]} />
            ) : (
              <SpecList diamond={diamond} order={["carat", "cut", "color", "clarity"]} />
            )}
            <div className="flex items-center gap-3">
              <Button variant="link" className="h-auto px-0 py-2" onClick={() => notInTest("The GIA certificate")}>
                GIA Certified
              </Button>
              <span aria-hidden className="type-label-xs text-primary">
                ∙
              </span>
              {/* 4Cs education is Test 3.3 (later), so it's inert here. */}
              <Button variant="link" className="h-auto px-0 py-2" onClick={() => notInTest("4Cs education")}>
                Understand the 4Cs
              </Button>
            </div>
          </div>
        </section>
        <Separator className="my-3 bg-muted" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onSelect}>
              Select this Diamond
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More options" />}>
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => notInTest("Editing ring size")}>Edit Ring Size</DropdownMenuItem>
                <DropdownMenuItem onClick={() => notInTest("Reviewing your design")}>Review your design</DropdownMenuItem>
                <DropdownMenuItem onClick={() => notInTest("Sharing")}>Share</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 px-6" onClick={() => notInTest("Saving")}>
              <HeartStraightIcon />
              Save
            </Button>
            <Button variant="outline" className="flex-1 px-6" onClick={() => notInTest("Drop a hint")}>
              <EnvelopeSimpleIcon />
              Drop a Hint
            </Button>
          </div>
        </div>
        <Button variant="link" className="h-auto px-0 gap-2 py-2" onClick={() => notInTest("Chat")}>
          <MessageCircle />
          Chat with a Jewelry Consultant
        </Button>
      </div>
      <DyoAssurances />
      <DeliveryOptions />
    </div>
  )
}
