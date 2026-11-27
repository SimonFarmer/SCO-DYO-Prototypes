import { ChatCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { stoneShape } from "@/data/stones"
import { cn } from "@/lib/utils"

/**
 * Buy-form actions on the stone step (Figma "Frame 2055249630"): the primary action,
 * "View All {Shape} Stones (N)" and the consultant chat link (inert in the test).
 */
export function StoneCtas({
  primary,
  onPrimary,
  primaryDisabled,
  viewAllDisabled,
  viewAllUnavailable,
  shape,
  count,
  onViewAll,
}: {
  primary: string
  onPrimary: () => void
  primaryDisabled?: boolean
  viewAllDisabled?: boolean
  /** Shown as disabled but still clickable, so its click can say why (the full-flow study's part 2). */
  viewAllUnavailable?: boolean
  shape: string
  count: number
  onViewAll: () => void
}) {
  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={onPrimary} disabled={primaryDisabled}>
          {primary}
        </Button>
        <Button
          variant="outline"
          className={cn("w-full border-input", viewAllUnavailable && "opacity-50")}
          aria-disabled={viewAllUnavailable || undefined}
          onClick={onViewAll}
          disabled={viewAllDisabled}
        >
          View All {stoneShape(shape).label} Stones ({count.toLocaleString("en-US")})
        </Button>
      </div>
      <Button variant="link" className="self-center py-2" onClick={() => notInTest("Chat")}>
        <ChatCircleIcon /> Chat with a Jewelry Consultant
      </Button>
    </div>
  )
}
