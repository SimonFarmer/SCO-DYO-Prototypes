import { useVariant } from "@/lib/hooks"
import { FinishingTouchesB } from "./finishing-touches-b"
import { RingReviewA } from "./ring-review-a"

const VARIANTS = ["A", "B"] as const

/**
 * Test 4 · Ring Personalization as a Separate Step. Participant URLs: /test-4/a, /test-4/b.
 * A: options on Ring Review. B: Finishing Touches step → Ring Review (/test-4/b/review).
 */
export function Test4() {
  const variant = useVariant(VARIANTS)
  return variant === "B" ? <FinishingTouchesB /> : <RingReviewA />
}
