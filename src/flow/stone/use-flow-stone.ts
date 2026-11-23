import { useNavigate } from "react-router"
import { toStone, type Diamond } from "@/data/diamonds"
import { useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { useRingBuild } from "@/state/ring-build"

/**
 * "Select This Diamond" anywhere in the flow (recommendations, Quickview, Diamond PDP): the stone goes
 * into the flow build, so the stepper and step 3 show it, and the shopper moves on to step 3.
 */
export function useFlowSelectDiamond() {
  const { setStone } = useRingBuild()
  const flow = useFlow()
  const navigate = useNavigate()
  return (d: Diamond) => {
    setStone(toStone(d))
    navigate(flow ? flow.path(FLOW_ROUTES.finish) : FLOW_ROUTES.finish)
    window.scrollTo({ top: 0 })
  }
}
