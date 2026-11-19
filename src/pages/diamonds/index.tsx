import { useCallback, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { DiamondGlp } from "@/components/diamond/diamond-glp"
import { DiamondPdp } from "@/components/diamond/diamond-pdp"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import type { DyoStart } from "@/components/dyo/dyo-stepper"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { DIAMONDS, SHAPES, findDiamond, toStone, type Diamond } from "@/data/diamonds"
import { GLP_PATH } from "@/data/plp"
import { useRingBuild } from "@/state/ring-build"

export { GLP_PATH }

/** `?start=stone` marks a journey begun from Shop by Stone; it rides along to the PDP. */
function useDyoStart(): DyoStart {
  return useSearchParams()[0].get("start") === "stone" ? "stone" : "setting"
}

/** Selecting a stone records it on the ring build; the next step (a setting, or finishing touches) is outside this prototype. */
function useSelectStone(start: DyoStart) {
  const { setStone } = useRingBuild()
  const notInTest = useNotInTest()
  return (d: Diamond) => {
    setStone(toStone(d))
    notInTest(start === "stone" ? "Choosing a setting" : "Finishing touches")
  }
}

/** Diamond GLP prototype (DYO stone step): any tile opens the Quickview; Full Details opens the PDP. */
export function NaturalDiamondsGlp() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const start = useDyoStart()
  const select = useSelectStone(start)
  const [quickview, setQuickview] = useState<Diamond | null>(null)
  const shapeParam = params.get("shape")
  const entryShape = SHAPES.find((s) => s.toLowerCase() === shapeParam) ?? null
  const dropEntry = useCallback(
    () =>
      setParams(
        (p) => {
          p.delete("shape")
          return p
        },
        { replace: true },
      ),
    [setParams],
  )
  return (
    <>
      <DiamondGlp onOpen={setQuickview} start={start} entryShape={entryShape} onEntryApplied={dropEntry} />
      <DiamondQuickview
        diamond={quickview}
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={select}
        onViewDetails={(d) => {
          setQuickview(null)
          navigate(`${GLP_PATH}/${d.id}${start === "stone" ? "?start=stone" : ""}`)
          window.scrollTo(0, 0)
        }}
      />
    </>
  )
}

/** Diamond PDP reached from the GLP Quickview's "View Full Details". */
export function NaturalDiamondPdp() {
  const start = useDyoStart()
  const select = useSelectStone(start)
  const diamond = findDiamond(useParams().id) ?? DIAMONDS[0]
  return <DiamondPdp key={diamond.id} diamond={diamond} specLayout="list" start={start} onSelect={() => select(diamond)} />
}
