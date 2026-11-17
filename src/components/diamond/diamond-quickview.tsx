import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { HeartStraightIcon, PlayIcon, XIcon } from "@phosphor-icons/react"
import { EllipsisVertical } from "lucide-react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { SpecList } from "@/components/diamond/diamond-specs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DIAMOND_IMAGE, diamondTitle, type Diamond } from "@/data/diamonds"
import { DELIVERY } from "@/data/dyo"
import { formatPrice } from "@/lib/format"

interface DiamondQuickviewProps {
  diamond: Diamond | null
  onOpenChange: (open: boolean) => void
  onSelect: (d: Diamond) => void
  onViewDetails: (d: Diamond) => void
}

/** Stone Quickview modal (Figma “Diamond Overlay”, 7375:133345) — Test 3.1 variant B. */
export function DiamondQuickview({ diamond, onOpenChange, onSelect, onViewDetails }: DiamondQuickviewProps) {
  const notInTest = useNotInTest()
  return (
    <Dialog open={diamond !== null} onOpenChange={onOpenChange}>
      {/* Figma: 920px wide dialog, 32px padding and gap. */}
      <DialogContent showCloseButton={false} className="max-h-[calc(100svh-2rem)] gap-8 overflow-y-auto rounded-none bg-background p-8 ring-0 shadow-xl md:max-w-4xl md:grid-cols-2">
        {diamond && (
          <>
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[412/400] overflow-clip">
                <img src={DIAMOND_IMAGE} alt={`${diamondTitle(diamond)}, 360° view`} className="size-full object-cover" />
                {diamond.topSeller && (
                  <span className="absolute top-3 left-3 flex h-5 items-center bg-primary px-2 text-xxs leading-3 font-semibold tracking-[1px] text-primary-foreground uppercase">
                    Top seller
                  </span>
                )}
                <button type="button" aria-label="Save" onClick={() => notInTest("Saving")} className="absolute top-3 right-3 cursor-pointer p-1">
                  <HeartStraightIcon className="size-4 text-primary" />
                </button>
                <button
                  type="button"
                  onClick={() => notInTest("The 360° video")}
                  className="absolute right-3 bottom-3 flex h-6 cursor-pointer items-center gap-2 p-1 text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase"
                >
                  <PlayIcon className="size-4" />
                  360°
                </button>
              </div>
              <div className="flex gap-2">
                <span className="size-16 overflow-clip border border-primary">
                  <img src={DIAMOND_IMAGE} alt="" className="size-full object-cover" />
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <DialogPrimitive.Title className="flex-1 type-h4 font-medium text-primary">{diamondTitle(diamond)}</DialogPrimitive.Title>
                <DialogPrimitive.Close render={<Button variant="ghost" size="icon" aria-label="Close" />}>
                  <XIcon />
                </DialogPrimitive.Close>
              </div>
              <p className="flex items-baseline gap-2 font-semibold text-muted-foreground">
                <span className="text-lg leading-none">{formatPrice(diamond.price)}</span>
                <span className="type-label-xs">Diamond only</span>
              </p>
              <SpecList diamond={diamond} order={["carat", "clarity", "color", "cut"]} />
              <Button variant="link" className="h-auto px-0 w-fit" onClick={() => onViewDetails(diamond)}>
                View more specifications
              </Button>
              <Button variant="link" className="h-auto px-0 w-fit" onClick={() => notInTest("The GIA certificate")}>
                View GIA certificate
              </Button>
              <p className="text-xs leading-none text-muted-foreground">
                Order now and it ships {DELIVERY.shipBy.replace("By", "by")}.
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="flex w-full gap-2">
                  <Button className="flex-1" onClick={() => onSelect(diamond)}>
                    Select this Diamond
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More options" />}>
                      <EllipsisVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => notInTest("Adding to a ring")}>Add to a ring</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => notInTest("Adding to a pendant")}>Add to a pendant</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => notInTest("Adding a loose stone to bag")}>Add loose stone to bag</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button variant="link" className="h-auto px-0 py-2" onClick={() => onViewDetails(diamond)}>
                  View Full Details
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
