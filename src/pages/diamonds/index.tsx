import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { DiamondGlp } from "@/components/diamond/diamond-glp"
import { DiamondPdp } from "@/components/diamond/diamond-pdp"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { DIAMONDS, findDiamond, toStone, type Diamond } from "@/data/diamonds"
import { useRingBuild } from "@/state/ring-build"

export const GLP_PATH = "/natural-diamonds"

/** Selecting a stone records it on the ring build; the next step (Finishing Touches) is outside this prototype. */
function useSelectStone() {
  const { setStone } = useRingBuild()
  const notInTest = useNotInTest()
  return (d: Diamond) => {
    setStone(toStone(d))
    notInTest("Finishing touches")
  }
}

/** Diamond GLP prototype (DYO step 2): any tile opens the Quickview; Full Details opens the PDP. */
export function NaturalDiamondsGlp() {
  const navigate = useNavigate()
  const select = useSelectStone()
  const [quickview, setQuickview] = useState<Diamond | null>(null)
  return (
    <>
      <DiamondGlp onOpen={setQuickview} />
      <DiamondQuickview
        diamond={quickview}
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={select}
        onViewDetails={(d) => {
          setQuickview(null)
          navigate(`${GLP_PATH}/${d.id}`)
          window.scrollTo(0, 0)
        }}
      />
    </>
  )
}

/** Diamond PDP reached from the GLP Quickview's "View Full Details". */
export function NaturalDiamondPdp() {
  const select = useSelectStone()
  const diamond = findDiamond(useParams().id) ?? DIAMONDS[0]
  return <DiamondPdp key={diamond.id} diamond={diamond} specLayout="list" onSelect={() => select(diamond)} />
}
