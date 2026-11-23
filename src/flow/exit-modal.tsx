import { HeartStraightIcon, XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

/**
 * "Navigating away will lose customization!" (Figma SCO Drop 3b – Customizer 8045:124097, 412×240):
 * Cancel stays, OK leaves and drops the build, Save & Navigate Away keeps the ring in the Wish List.
 */
export function FlowExitModal({
  open,
  onCancel,
  onLeave,
  onSaveAndLeave,
}: {
  open: boolean
  onCancel: () => void
  onLeave: () => void
  onSaveAndLeave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      {/* Figma: 24px padding, 32px between the title row and the buttons, square corners. */}
      <DialogContent showCloseButton={false} className="gap-8 rounded-none bg-background p-6 ring-0 md:max-w-103">
        <div className="flex items-start gap-4">
          <DialogTitle className="flex-1 font-heading text-3xl leading-10 font-semibold tracking-[-0.025em] text-primary">
            Navigating away will lose customization!
          </DialogTitle>
          <button type="button" onClick={onCancel} aria-label="Close" className="flex cursor-pointer items-center justify-center p-3 text-primary">
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-input" onClick={onCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onLeave}>
              OK
            </Button>
          </div>
          <Button variant="outline" className="w-full border-input" onClick={onSaveAndLeave}>
            <HeartStraightIcon />
            Save &amp; Navigate Away
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
