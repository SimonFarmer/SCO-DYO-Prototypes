import { XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { Listing } from "@/components/plp/use-listing"

/**
 * Stone-first flow (setting removed with a stone picked): the settings PLP is filtered to the stone's shape,
 * and moving to another shape would drop the stone. Asks first. No Figma frame: the exit modal's style
 * (8045:124097), with a line saying what is lost.
 */
export function ShapeChangeModal({ guard }: { guard: Listing["shapeGuard"] }) {
  return (
    <Dialog open={guard.open} onOpenChange={(o) => !o && guard.cancel()}>
      <DialogContent showCloseButton={false} className="gap-8 rounded-none bg-background p-6 ring-0 md:max-w-103">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-4">
            <DialogTitle className="flex-1 font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">
              Changing the shape will remove your stone
            </DialogTitle>
            <button type="button" onClick={guard.cancel} aria-label="Close" className="flex cursor-pointer items-center justify-center p-3 text-primary">
              <XIcon className="size-4" />
            </button>
          </div>
          <DialogDescription className="text-sm leading-5 text-muted-foreground">
            The stone you chose only fits {guard.stoneShape.toLowerCase()} settings. If you change the shape, you’ll choose a new stone after
            your setting.
          </DialogDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 border-input" onClick={guard.cancel}>
            Keep {guard.stoneShape}
          </Button>
          <Button className="flex-1" onClick={guard.confirm}>
            Change Shape
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
