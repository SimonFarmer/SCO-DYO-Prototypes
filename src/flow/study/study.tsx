import { useEffect, useRef } from "react"
import { Navigate, useNavigate, useParams } from "react-router"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { diamondTitle, type Diamond } from "@/data/diamonds"
import { flowMetalFor, flowSettingFor } from "@/data/flow-settings"
import { METALS, galleryFor, type MetalId, type Setting } from "@/data/products"
import { STONES, stoneImage, toQuickviewDiamond, type StoneTypeId } from "@/data/stones"
import { toStone } from "@/data/diamonds"
import { plpQueryKey, stoneQueryKey, useFlow, type StudyPart } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { firstStoneQuery, flowStonePath } from "@/flow/stone/simulator"
import { formatPrice } from "@/lib/format"
import { useRingBuild } from "@/state/ring-build"
import type { TaskEnd } from "./study-modals"

/*
 * Full-flow study (Lucid "Shane Co DYO Testing Ideas" › "Full-flow test plan for Nov 30"): a between-subjects A/B
 * test of the two step interfaces. Each participant gets one flow (A: step by step under /study/a, B: accordion
 * under /study/b) and does four tasks in it, each from its own link, so the moderator can ask questions between
 * them. The pages are the full flows' own; this file sets up each task's start and builds its end-of-task modal.
 *
 *   Part 1 · Choose a Setting            homepage → "Select this Setting" (B: "Continue to Stone") ends the task
 *   Part 2 · Preview + Recommendations   fixed setting, stone preview → picking a recommended diamond ends it;
 *                                        View All looks disabled and says it isn't part of this task
 *   Part 3 · Browse All Diamonds         same start → Select on the recommendations points to View All; selecting
 *                                        from the catalog's Quickview or a Diamond PDP ends it
 *   Part 4 · Personalize and Finish      setting, metal and diamond preselected → Add Ring to Bag ends it
 */

/** The fixed setting for parts 2–4, the same for every participant: Timeless Solitaire in 14k white gold ($690). */
export const STUDY_SETTING: { id: string; metal: MetalId } = { id: "timeless-solitaire", metal: "14k-white-gold" }

/** Part 4's preselected diamond: 1.09 ct round, G, VS1, Excellent ($3,765), so the ring starts at $4,455. */
export const STUDY_DIAMOND_ID = "natural-round-2724"

const PARTS: StudyPart[] = [1, 2, 3, 4]

/**
 * A task's entry link (/study/a/part/2 …): clears the flow's build, sets up the task's start (nothing from an
 * earlier task carries over) and replaces itself with the task's first page.
 */
export function StudyStart() {
  const { n } = useParams()
  const flow = useFlow()
  const build = useRingBuild()
  const navigate = useNavigate()
  const done = useRef(false)
  const part = PARTS.find((p) => String(p) === n)

  useEffect(() => {
    if (!flow?.study || !part || done.current) return
    done.current = true
    flow.study.setPart(part)
    build.reset()
    try {
      // The stepper's Edit on the stone returns to the last preferences: none yet in a new task.
      sessionStorage.removeItem(stoneQueryKey(flow.base))
      sessionStorage.removeItem(plpQueryKey(flow.base))
    } catch {
      /* storage unavailable */
    }
    window.scrollTo({ top: 0 })
    if (part === 1) return void navigate(flow.path("/"), { replace: true })

    const setting = flowSettingFor(STUDY_SETTING.id)
    const metal = flowMetalFor(setting, STUDY_SETTING.metal)
    const price = setting.variants.find((v) => v.metal === metal)?.price ?? 0
    build.setSetting(setting.id, metal)
    build.setSettingChosen(true)
    if (part === 4) {
      const stone = STONES.find((s) => s.id === STUDY_DIAMOND_ID)
      if (stone) build.setStone(toStone(toQuickviewDiamond(stone)))
      return void navigate(flow.path(FLOW_ROUTES.finish), { replace: true })
    }
    // Parts 2 and 3: the stone preview with nothing chosen yet (round, the preview's own defaults).
    navigate(flow.path(flowStonePath("preferences", firstStoneQuery(flow.config.t2, "round", price))), { replace: true })
  }, [flow, part, build, navigate])

  if (!flow?.study || !part) return <Navigate to="/" replace />
  return null
}

/** Part 1's end: the setting in the metal the participant chose. */
export function settingTaskEnd(setting: Setting, metal: MetalId): TaskEnd {
  const variant = setting.variants.find((v) => v.metal === metal) ?? setting.variants[0]
  const hero = galleryFor(setting, metal)[0]
  return {
    title: "Great choice",
    description: "You’ve chosen the setting you’d go with.",
    item: {
      image: hero?.kind === "image" ? hero.src : undefined,
      name: setting.name,
      details: [METALS[variant.metal].label],
      price: variant.price,
      priceLabel: "Setting only",
    },
  }
}

/** Parts 2 and 3: the diamond, with the ring total on the fixed setting. */
export function diamondTaskEnd(diamond: Diamond, settingPrice: number): TaskEnd {
  const stone = STONES.find((s) => s.id === diamond.id)
  return {
    title: "Great choice",
    description: "You’ve chosen the diamond for your ring.",
    item: {
      image: stone ? stoneImage(stone).src : undefined,
      name: diamondTitle(diamond),
      details: [`${diamond.color} color · ${diamond.clarity} clarity · ${diamond.cut} cut`, `Diamond only: ${formatPrice(diamond.price)}`],
      price: settingPrice + diamond.price,
      priceLabel: "Ring total",
    },
  }
}

/** Part 4: the ring as added to the bag, every choice listed. */
export function useRingTaskEnd(): () => TaskEnd {
  const { setting, stone, crown, engraving, band, bandEngraving, ringSize, total } = useRingBuild()
  return () => ({
    title: "Added to your bag",
    description: "Your ring is in your bag.",
    item: {
      image: setting.image,
      name: `${setting.name} with a ${stone.title}`,
      details: [
        setting.metal,
        ...(ringSize ? [`Ring size ${ringSize}`] : []),
        ...(crown ? [crown.name] : []),
        ...(engraving ? [`Engraving: “${engraving.text}”`] : []),
        ...(band ? [band.name] : []),
        ...(bandEngraving ? [`Band engraving: “${bandEngraving.text}”`] : []),
      ],
      price: total,
      priceLabel: "Total",
    },
  })
}

/**
 * Part 2's View All: looks and clicks as usual, but the click shows the "not part of this test" notice (as the other
 * out-of-scope controls) instead of opening the catalog. Elsewhere (the full flows, part 3) it works as usual.
 */
export function useStudyViewAll() {
  const flow = useFlow()
  const notInTest = useNotInTest()
  return {
    /** Wraps the View All action: in part 2 the "not part of this test" notice instead. */
    guard: (action: () => void) => () => (flow?.study?.part === 2 ? notInTest("Viewing all stones") : action()),
  }
}

/**
 * Which stone types the flow carries: natural diamonds, plus lab-grown in the full-flow study (Test 2's lab-grown
 * stock and prices). Gemstones, and lab-grown in the full flows, show "not part of this test".
 */
export function useFlowStoneTypes() {
  const study = useFlow()?.study != null
  const notInTest = useNotInTest()
  return {
    carries: (type: StoneTypeId) => type === "natural" || (study && type === "lab"),
    notCarried: () => notInTest(study ? "Gemstones" : "Lab-grown diamonds and gemstones"),
  }
}

/** Add Ring to Bag: in the study it ends the task (part 4) with the ring as built; in the full flows, the end screen. */
export function useStudyAddToBag(addToBag: () => void) {
  const flow = useFlow()
  const end = useRingTaskEnd()
  return () => (flow?.study ? flow.study.endTask(end()) : addToBag())
}
