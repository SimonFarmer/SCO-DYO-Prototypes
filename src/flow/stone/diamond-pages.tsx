import { useParams } from "react-router"
import { DiamondPdp } from "@/components/diamond/diamond-pdp"
import { DIAMONDS } from "@/data/diamonds"
import { useFlow } from "@/flow/flow-context"
import { SPECS_VARIANTS } from "@/pages/test-3/variants"
import { findFlowDiamond } from "./find-diamond"
import { useFlowSelectDiamond } from "./use-flow-stone"

/**
 * Full DYO flow · Diamond PDP ("Full Details" from the Quickview, or a tile/pick with flow t31 A): Test 3's
 * Diamond PDP as is, for a stone of the flow's stock, spec layout from the flow config (t32).
 */
export function FlowDiamondPdp() {
  const flow = useFlow()
  const selectDiamond = useFlowSelectDiamond()
  const diamond = findFlowDiamond(useParams().id) ?? DIAMONDS[0]
  const layout = SPECS_VARIANTS[flow?.config.t32 ?? "A"].layout
  return <DiamondPdp key={diamond.id} diamond={diamond} specLayout={layout} onSelect={() => selectDiamond(diamond)} stickyBar />
}
