import type { ReactNode } from "react"
import { XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useIsDesktop } from "@/lib/hooks"
import { cn } from "@/lib/utils"

interface OverlaySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Shown beside the title, e.g. "+ $60". */
  titleSuffix?: ReactNode
  description?: string
  /** Sits under the header, outside the scroll area (e.g. tabs). */
  subheader?: ReactNode
  children: ReactNode
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  secondaryLabel?: string
  /** On mobile, cover the whole screen instead of an inset bottom sheet. */
  fullScreenMobile?: boolean
}

/**
 * PDP overlay (Figma "PDP Overlays"): right-hand drawer on desktop, bottom sheet on mobile.
 * Header, scrolling body, stacked primary/secondary actions.
 */
export function OverlaySheet({
  open,
  onOpenChange,
  title,
  titleSuffix,
  description,
  subheader,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel = "Cancel",
  fullScreenMobile = false,
}: OverlaySheetProps) {
  const isDesktop = useIsDesktop()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        className={cn("gap-0", fullScreenMobile && "max-lg:data-[side=bottom]:top-0 max-lg:data-[side=bottom]:border-t-0")}
      >
        <div className="flex items-start gap-4 border-b border-muted px-10 pt-10 pb-6 max-lg:px-margin max-lg:pt-6">
          <div className="flex flex-1 flex-col gap-2">
            <SheetTitle className="flex items-baseline gap-2 type-h4 text-primary">
              {title}
              {titleSuffix && <span className="font-sans text-sm leading-5 font-medium tracking-normal">{titleSuffix}</span>}
            </SheetTitle>
            {description && <SheetDescription className="text-sm leading-5 text-primary">{description}</SheetDescription>}
          </div>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
            <XIcon className="size-5" />
          </SheetClose>
        </div>
        {subheader}
        <div className="flex-1 overflow-y-auto px-10 py-6 max-lg:px-margin">{children}</div>
        <div className="flex flex-col gap-2 border-t border-muted px-10 py-6 max-lg:px-margin max-lg:py-4">
          <Button onClick={onPrimary} disabled={primaryDisabled} className="w-full">
            {primaryLabel}
          </Button>
          <SheetClose render={<Button variant="outline" className="w-full" />}>{secondaryLabel}</SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
