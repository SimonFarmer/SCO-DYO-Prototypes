import { useState } from "react"
import { CaretLeftIcon, XIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { stoneImage, stoneSpecs, stoneTitle, type StonePick } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { useIsDesktop } from "@/lib/hooks"
import { cn } from "@/lib/utils"

/*
 * Accordion steps flow · "Recommended for your ring" (Figma 7541:363745) and a pick's details (7541:363839): a
 * drawer on the right on desktop, full screen on phones, opening as the finishing-touches overlays do. The three picks list with nothing chosen; "View details"
 * swaps the list for that stone's details inside the same modal.
 */

/** Each pick's badge and line (Figma 7541:363771…363798). Our Pick is the dark badge. */
const PICK_COPY: Record<StonePick["kind"], { badge: string; line: (bySize: boolean) => string }> = {
  size: { badge: "Best Price", line: (bySize) => (bySize ? "The biggest stone near your preferred size." : "The biggest stone your budget allows.") },
  value: { badge: "Our Pick", line: () => "The best balance of size, sparkle and color." },
  quality: { badge: "Best Quality", line: () => "Top grades in a slightly smaller size." },
}

function PickBadge({ kind }: { kind: StonePick["kind"] }) {
  return (
    <span
      className={cn(
        "flex h-5 w-fit shrink-0 items-center px-2 text-[10px] leading-3 font-semibold tracking-[1px] uppercase",
        kind === "value" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
      )}
    >
      {PICK_COPY[kind].badge}
    </span>
  )
}

/** Underlined caps link (Figma "Button" link style). */
function LinkButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex w-fit cursor-pointer items-center gap-0.5 type-label-xs text-primary underline", className)}>
      {children}
    </button>
  )
}

/** A pick's photo: the stone's face-up shot (gemstones without one: the ring render, cropped in). */
function PickPhoto({ pick, className }: { pick: StonePick; className?: string }) {
  const img = stoneImage(pick.stone)
  return (
    <div className={cn("overflow-hidden bg-secondary", className)}>
      <img
        src={img.src}
        alt=""
        className={cn("size-full", img.render ? "origin-[50%_30%] scale-[2.4] object-contain" : img.photo ? "object-cover" : "object-contain p-2.5 mix-blend-multiply")}
      />
    </div>
  )
}

export function RecommendationsSheet({
  open,
  onClose,
  picks,
  basis,
  bySize,
  settingPrice,
  stoneCount,
  onEditPreferences,
  onSelect,
  onViewAll,
}: {
  open: boolean
  /** Closing (the X, the scrim, Esc) returns to the stone preferences. */
  onClose: () => void
  picks: StonePick[]
  /** "Natural · Round · Up to $7,000" */
  basis: string
  /** Carat-first: the biggest pick is "near your preferred size" rather than "your budget allows". */
  bySize: boolean
  settingPrice: number
  stoneCount: number
  onEditPreferences: () => void
  onSelect: (pick: StonePick) => void
  onViewAll: () => void
}) {
  const isDesktop = useIsDesktop()
  const notInTest = useNotInTest()
  const [chosen, setChosen] = useState<StonePick["kind"] | null>(null)
  const [details, setDetails] = useState<StonePick["kind"] | null>(null)
  // A fresh visit starts on the list with nothing chosen.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setChosen(null)
      setDetails(null)
    }
  }
  const shown = picks.find((p) => p.kind === details) ?? null
  const selected = shown ?? picks.find((p) => p.kind === chosen) ?? null
  const ringTotal = (p: StonePick) => formatPrice(settingPrice + p.stone.price)

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        // Same side and motion as the finishing-touches overlays (OverlaySheet with fullScreenMobile): a right-hand
        // drawer on desktop, a full-screen sheet from the bottom on phones.
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        className="gap-0 max-lg:data-[side=bottom]:top-0 max-lg:data-[side=bottom]:border-t-0"
      >
        {/* Header (Figma 7541:363747): title, the preferences it's based on with Edit, close. */}
        <div className="flex items-start gap-6 border-b border-muted px-6 py-8 max-lg:px-margin max-lg:py-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <SheetTitle className="type-h4 text-primary">Recommended for your ring</SheetTitle>
            <SheetDescription render={<div />} className="flex flex-wrap items-center gap-1.5 text-xs leading-none text-muted-foreground">
              <span>{basis} ·</span>
              <LinkButton onClick={onEditPreferences}>Edit</LinkButton>
            </SheetDescription>
          </div>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
            <XIcon className="size-5" />
          </SheetClose>
        </div>
        <div className={cn("flex items-center border-b px-6 py-3 max-lg:px-margin", shown ? "border-muted" : "border-input")}>
          <LinkButton onClick={shown ? () => setDetails(null) : onEditPreferences} className="h-6">
            <CaretLeftIcon className="size-4" aria-hidden />
            {shown ? "Back to Recommendations" : "Stone Preferences"}
          </LinkButton>
        </div>

        <div className="flex-1 overflow-y-auto">
          {shown ? (
            // A pick's details (Figma 7541:363857).
            <div key={shown.kind} className="flex flex-col animate-in fade-in duration-200">
              {/* The whole stone (Figma 7541:363860): the photo contained, the same photo blurred behind to fill the band. */}
              <div className="relative h-67 w-full overflow-hidden bg-secondary">
                <img src={stoneImage(shown.stone).src} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover blur-2xl" />
                <img src={stoneImage(shown.stone).src} alt={stoneTitle(shown.stone)} className="relative size-full object-contain" />
              </div>
              <div className="flex flex-col gap-6 p-6 max-lg:px-margin">
                <div className="flex flex-col gap-2">
                  <PickBadge kind={shown.kind} />
                  <p className="text-sm leading-5 font-medium text-primary">{PICK_COPY[shown.kind].line(bySize)}</p>
                </div>
                <div className="h-px bg-input" />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 text-primary">
                    <h3 className="type-h4">{stoneTitle(shown.stone)}</h3>
                    <p className="flex flex-wrap gap-2 text-sm leading-5 font-semibold">
                      <span>Ring Total: {ringTotal(shown)}</span>
                      <span aria-hidden>·</span>
                      <span>Diamond Only: {formatPrice(shown.stone.price)}</span>
                    </p>
                  </div>
                  <dl className="flex flex-col">
                    {[
                      { label: "Carat", value: `${shown.stone.carat.toFixed(2)} ct` },
                      { label: "Clarity", value: stoneSpecs(shown.stone).clarity },
                      { label: "Color", value: stoneSpecs(shown.stone).color },
                      { label: "Cut", value: stoneSpecs(shown.stone).cut },
                    ].map((row) => (
                      <div key={row.label} className="flex h-12 items-center justify-between gap-4 border-b border-input text-sm leading-5">
                        <dt className="font-semibold text-foreground">{row.label}</dt>
                        <dd className="font-medium text-primary">{row.value}</dd>
                      </div>
                    ))}
                    <div className="flex h-12 items-center justify-between gap-4 text-sm leading-5">
                      <dt className="font-semibold text-foreground">Certificate</dt>
                      <dd>
                        <button type="button" onClick={() => notInTest("Grading certificates")} className="cursor-pointer font-medium text-primary underline">
                          GIA · View Certificate
                        </button>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ) : picks.length ? (
            // The picks (Figma 7541:363764): photo, badge and radio, name, line, ring total, View details.
            <RadioGroup value={chosen} onValueChange={(v) => setChosen(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-0">
              {picks.map((p) => (
                <label key={p.kind} className="flex cursor-pointer items-start gap-5 border-b border-input p-6 last:border-b-0 hover:bg-bg-input-50 max-lg:gap-4 max-lg:px-margin">
                  <PickPhoto pick={p} className="size-25.75 shrink-0 max-lg:size-20" />
                  <span className="flex min-w-0 flex-1 flex-col gap-3 text-primary">
                    <span className="flex flex-col gap-1.5">
                      <span className="flex items-start justify-between gap-4">
                        <PickBadge kind={p.kind} />
                        <RadioGroupItem value={p.kind} aria-label={stoneTitle(p.stone)} />
                      </span>
                      <span className="text-sm leading-5 font-semibold">{stoneTitle(p.stone)}</span>
                      <span className="text-xs leading-4 tracking-[0.12px]">{PICK_COPY[p.kind].line(bySize)}</span>
                    </span>
                    <span className="text-sm leading-5 font-semibold">Ring Total: {ringTotal(p)}</span>
                    <LinkButton
                      onClick={() => {
                        setChosen(p.kind)
                        setDetails(p.kind)
                      }}
                    >
                      View details
                    </LinkButton>
                  </span>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <div className="flex flex-col gap-2 p-6 max-lg:px-margin">
              <p className="type-h5 text-primary">No stones match these preferences</p>
              <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
            </div>
          )}
        </div>

        {/* Footer (Figma 7541:363801): Select waits for a pick; View all goes to the shape's stones. */}
        <div className="flex flex-col gap-2 border-t border-muted px-6 py-5 max-lg:px-margin max-lg:py-4">
          <Button className="w-full" disabled={!selected} onClick={() => selected && onSelect(selected)}>
            Select this Diamond
          </Button>
          <Button variant="outline" className="w-full" onClick={onViewAll}>
            View all stones ({stoneCount.toLocaleString("en-US")})
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
