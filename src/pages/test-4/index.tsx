import { useVariant } from "@/lib/hooks"
import { FinishingTouchesB } from "./finishing-touches-b"
import { RingReviewA } from "./ring-review-a"

const VARIANTS = ["A", "B"] as const

/**
 * Test 4 · Ring Personalization as a Separate Step. Switch with ?variant=A|B.
 * A: options on Ring Review. B: Finishing Touches step → Ring Review (/test-4/review?variant=B).
 */
export function Test4() {
  const variant = useVariant(VARIANTS)
  return variant === "B" ? <FinishingTouchesB /> : <RingReviewA />
}
