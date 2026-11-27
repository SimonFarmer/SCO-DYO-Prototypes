import { useState, type ReactNode } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { HeartStraightIcon, PlayIcon, XIcon } from "@phosphor-icons/react"
import { PriceExplained } from "@/components/diamond/diamond-buy-form"
import { SpecList } from "@/components/diamond/diamond-specs"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { diamondTitle, type Diamond } from "@/data/diamonds"
import { stoneImage, stoneSpecs, stoneTitle, type StonePick } from "@/data/stones"
import { SpecStrip, pickHeadline } from "@/flow/stone/recommendations-page"
import { formatPrice } from "@/lib/format"

/*
 * Full-flow study · part 3's Quickviews (Figma SCO Drop 3b – Customizer):
 *   PickQuickview     "From Recommendations" (8287:14562): a recommended pick's View details, with copy on why it was
 *                     picked (8279:100436 biggest stone, 8279:100437 best balance, 8279:100447 top grades)
 *   CatalogQuickview  the Diamond PLP's tile (8287:14466): the stone, its price and 4Cs, Select and View Full Details
 * Desktop frames only: on phones each stacks the photo over the details, as the Test 3 Quickview does.
 */

/** The last non-null value, so a modal keeps its content while it animates closed. */
function useLast<T>(value: T | null): T | null {
  const [last, setLast] = useState(value)
  if (value !== null && value !== last) setLast(value)
  return value ?? last
}

const B = ({ children }: { children: ReactNode }) => <span className="font-semibold">{children}</span>

/** "a J color", "an H color": the article for a grade read letter by letter (diamond colors D–Z). */
const article = (grade: string) => (/^[AEFHILMNORSX]/.test(grade) ? "an" : "a")

/** The cut line under each pick's copy (Figma: Excellent on the biggest stone, Very Good on the balance, Good on top grades). */
function cutLine(cut: string, kind: StonePick["kind"]): ReactNode {
  const c = <B>{cut} cut</B>
  switch (cut) {
    case "Excellent":
      return <>An {c} keeps it bright and full of sparkle, {kind === "size" ? "so you get a bigger look without giving up brilliance." : "so it shows off every facet."}</>
    case "Very Good":
      return <>A {c} returns most of the light that enters it, so it looks bright and lively at a price that leaves room for size and color.</>
    case "Good":
      return <>A {c} keeps a nice level of sparkle while freeing up budget for size and color.</>
    case "Shane Classic":
      return <>A {c}, our signature, gives it maximum sparkle and brilliance.</>
    default:
      return <>A {c} gives it a softer sparkle and keeps more of your budget for size.</>
  }
}

/**
 * Why this pick (Figma 8279:100436 / 100437 / 100447), with the stone's own carat, color and clarity. `nearSize`: the
 * picks were matched on the preferred size (carat first, or outside the budget) rather than the budget.
 */
function pickCopy(pick: StonePick, nearSize: boolean): ReactNode {
  const specs = stoneSpecs(pick.stone)
  const carats = <B>{pick.stone.carat.toFixed(2)} carats</B>
  const color = <B>{specs.color} color</B>
  const clarity = <B>{specs.clarity} clarity</B>
  if (pick.kind === "size")
    return (
      <>
        At {carats}, this is the biggest diamond {nearSize ? "near your preferred size" : "within your budget"}. To get you more size, this stone has {article(specs.color)} {color} and{" "}
        {clarity}, mid-range grades that put more of your budget toward carat weight.
      </>
    )
  if (pick.kind === "value")
    return (
      <>
        At {carats}, this stone is close to {nearSize ? "your preferred size" : "the largest your budget allows"}, with better grades than the biggest option. Its {color} and{" "}
        {clarity} look clean and bright to the eye, so your budget goes toward size, not differences only visible under magnification.
      </>
    )
  return (
    <>
      At {carats}, this stone is a little smaller than your other picks, but it has the highest grades {nearSize ? "of the three" : "within your budget"}: {color} and {clarity}.
      You get a whiter, cleaner diamond{nearSize ? "." : " without going over your budget."}
    </>
  )
}

/** Underlined caps link (Figma "Button" link style). */
function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer type-label-xs whitespace-nowrap text-primary underline">
      {children}
    </button>
  )
}

/** A recommended pick's View details (Figma "From Recommendations", 8287:14562): photo left, why it was picked right. */
export function PickQuickview({
  pick: current,
  nearSize,
  onClose,
  onSelect,
  onFullDetails,
}: {
  pick: StonePick | null
  nearSize: boolean
  onClose: () => void
  onSelect: (pick: StonePick) => void
  onFullDetails: (pick: StonePick) => void
}) {
  const notInTest = useNotInTest()
  const pick = useLast(current)
  return (
    <Dialog open={current !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden rounded-none bg-background p-0 ring-0 shadow-xl md:grid md:h-115 md:max-w-230 md:grid-cols-2"
      >
        {pick && (
          <>
            {/* The stone's photo, full bleed (phones: a band above the details). */}
            <div className="relative flex shrink-0 items-center justify-center bg-secondary max-md:h-60">
              <img src={stoneImage(pick.stone).src} alt={`${stoneTitle(pick.stone)}, 360° view`} className="size-full object-contain md:aspect-square" />
              <button
                type="button"
                onClick={() => notInTest("The 360° video")}
                className="absolute right-3 bottom-3 flex h-6 cursor-pointer items-center gap-2 p-1 text-xxs leading-3 font-semibold tracking-[1px] text-primary uppercase"
              >
                <PlayIcon className="size-4" />
                360°
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-10 max-md:p-5">
                <div className="flex items-start gap-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-primary">
                    <DialogPrimitive.Title className="type-h4 font-medium">{pickHeadline(pick, nearSize)}</DialogPrimitive.Title>
                    <p className="type-caption tracking-[0.12px]">{stoneTitle(pick.stone)}</p>
                  </div>
                  <DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" aria-label="Close" className="shrink-0" />}>
                    <XIcon className="size-5" />
                  </DialogPrimitive.Close>
                </div>
                <SpecStrip pick={pick} plain />
                <div className="flex flex-col gap-5 text-sm leading-5 text-primary">
                  <p>{pickCopy(pick, nearSize)}</p>
                  <p>{cutLine(stoneSpecs(pick.stone).cut, pick.kind)}</p>
                </div>
                <div className="flex items-start gap-2 type-label-xs text-primary">
                  <TextLink onClick={() => onFullDetails(pick)}>View Full Details</TextLink>
                  <span aria-hidden>∙</span>
                  <TextLink onClick={() => notInTest("The GIA certificate")}>GIA Certificate</TextLink>
                </div>
              </div>

              {/* Footer (Figma 8287:14595): the stone price with View Full Details, then Select. */}
              <div className="flex shrink-0 flex-col gap-2 border-t border-muted px-10 py-3 max-md:px-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="flex items-baseline gap-2 whitespace-nowrap text-primary">
                    <span className="text-sm leading-5 font-semibold">{formatPrice(pick.stone.price)}</span>
                    <span className="text-xs leading-3 tracking-[1px] uppercase">Stone only</span>
                  </p>
                  <span className="py-2">
                    <TextLink onClick={() => onFullDetails(pick)}>View Full Details</TextLink>
                  </span>
                </div>
                <Button className="w-full" onClick={() => onSelect(pick)}>
                  Select this Diamond
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** The Diamond PLP's tile (Figma 8287:14466): photo, the stone with its price and 4Cs, Select and View Full Details. */
export function CatalogQuickview({
  diamond: current,
  title,
  onClose,
  onSelect,
  onFullDetails,
}: {
  diamond: Diamond | null
  title?: string
  onClose: () => void
  onSelect: (d: Diamond) => void
  onFullDetails: (d: Diamond) => void
}) {
  const notInTest = useNotInTest()
  const diamond = useLast(current)
  const name = title ?? (diamond ? diamondTitle(diamond) : "")
  return (
    <Dialog open={current !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] grid-cols-1 gap-5 overflow-y-auto rounded-none bg-background p-5 pt-12 ring-0 shadow-xl md:max-w-230 md:grid-cols-2 md:gap-8 md:p-8"
      >
        {diamond && (
          <>
            {/* Phones: the photo comes first, so the close button sits above it rather than beside the title. */}
            <DialogPrimitive.Close render={<Button variant="ghost" size="icon" aria-label="Close" className="absolute top-2 right-2 md:hidden" />}>
              <XIcon />
            </DialogPrimitive.Close>
            <div className="relative aspect-square overflow-clip md:aspect-auto md:h-100">
              <img src={diamond.image} alt={`${name}, 360° view`} className="size-full object-cover" />
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

            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-start gap-4">
                <DialogPrimitive.Title className="flex-1 type-h4 font-medium text-primary">{name}</DialogPrimitive.Title>
                <DialogPrimitive.Close render={<Button variant="ghost" size="icon" aria-label="Close" className="max-md:hidden" />}>
                  <XIcon />
                </DialogPrimitive.Close>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="flex flex-1 items-baseline gap-2 font-semibold whitespace-nowrap text-muted-foreground">
                  <span className="text-lg leading-none">{formatPrice(diamond.price)}</span>
                  <span className="type-label-xs">Diamond only</span>
                </p>
                <PriceExplained diamond={diamond} stoneName={title} />
              </div>
              <SpecList diamond={diamond} order={["carat", "clarity", "color", "cut"]} />
              <div className="flex flex-col items-center gap-4">
                <Button className="w-full" onClick={() => onSelect(diamond)}>
                  Select this Diamond
                </Button>
                <Button variant="link" className="h-auto px-0 py-2" onClick={() => onFullDetails(diamond)}>
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
