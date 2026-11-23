import { findDiamond, type Diamond } from "@/data/diamonds"
import { STONES, toQuickviewDiamond } from "@/data/stones"

/**
 * A flow stone by id, as the Diamond the Quickview and Diamond PDP show. The flow's stone step (preferences,
 * picks and PLP) uses Test 2's stock, as Test 2 does; Test 3's catalog is the fallback for older links.
 */
export function findFlowDiamond(id: string | undefined): Diamond | undefined {
  if (!id) return undefined
  const stone = STONES.find((s) => s.id === id)
  return stone ? toQuickviewDiamond(stone) : findDiamond(id)
}
