import { useLocation, useNavigate } from "react-router"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { toStone, type Diamond } from "@/data/diamonds"
import { stoneShape } from "@/data/stones"
import { isAccordionBase, stripFlowBase, useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { diamondTaskEnd } from "@/flow/study/study"
import { useRingBuild } from "@/state/ring-build"

/**
 * "Select This Diamond" anywhere in the flow (recommendations, Quickview, Diamond PDP): the stone goes
 * into the flow build, so the stepper and step 3 show it, and the shopper moves on to step 3.
 *
 * In the full-flow study the choice ends the task instead (parts 2 and 3). Part 1 is about the setting: the stones
 * can be browsed from Shop by Stone, but choosing one says it isn't part of the task. Part 3 is about the full catalog, so
 * Select on the recommendations (the stone step, its Quickview included) points to View All rather than ending it.
 */
export function useFlowSelectDiamond() {
  const { setStone, setting } = useRingBuild()
  const flow = useFlow()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const notInTest = useNotInTest()
  return (d: Diamond) => {
    const study = flow?.study
    if (study) {
      if (study.part === 1) return notInTest("Choosing a diamond", "task")
      const onRecommendations = stripFlowBase(pathname).startsWith("/stone")
      if (study.part === 3 && onRecommendations) {
        const label = isAccordionBase(flow.base) ? `View all ${stoneShape(d.shape.toLowerCase()).label} stones` : `View All ${stoneShape(d.shape.toLowerCase()).label} Stones`
        return study.guideToCatalog(label)
      }
      return study.endTask(diamondTaskEnd(d, setting.price))
    }
    setStone(toStone(d))
    navigate(flow ? flow.path(FLOW_ROUTES.finish) : FLOW_ROUTES.finish)
    window.scrollTo({ top: 0 })
  }
}
