import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { HeartStraightIcon } from "@phosphor-icons/react"
import { diamondName } from "@/data/diamonds"
import { GLP_PATH } from "@/data/plp"
import { useRingBuild } from "@/state/ring-build"
import { findFlowDiamond } from "./stone/find-diamond"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { FlowExitModal } from "./exit-modal"
import { CatalogGuideModal, TaskEndModal, type TaskEnd } from "./study/study-modals"

/**
 * Full DYO flow (Test 5, moderated). Every flow page lives under /flow, so the unmoderated tests
 * (/test-1 … /test-4) stay untouched. Shared components read this context to keep links inside
 * the flow; outside it (no provider) they behave exactly as before.
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819 (section 5)
 */
export const FLOW_BASE = "/flow"

/**
 * The accordion steps flow (Lucid "Alternate UX – Accordion steps", a separate moderated flow test): same
 * machinery under its own base, with its own config and build, so it never touches /flow or the tests.
 */
export const ACCORDION_BASE = "/flow-accordion"

/**
 * The full-flow A/B study (Lucid "Full-flow test plan for Nov 30"): the same two flows split into four tasks, each
 * with its own start and an end-of-task modal. Flow A is the step-by-step flow, Flow B the accordion. Their own
 * bases (and builds), so /flow and /flow-accordion stay the linked-up full flows.
 */
export const STUDY_A_BASE = "/study/a"
export const STUDY_B_BASE = "/study/b"

const BASES = [ACCORDION_BASE, STUDY_A_BASE, STUDY_B_BASE, FLOW_BASE] as const
export type FlowBase = (typeof BASES)[number]

/** The bases that use the accordion step pages. */
// eslint-disable-next-line react-refresh/only-export-components
export const isAccordionBase = (base: FlowBase) => base === ACCORDION_BASE || base === STUDY_B_BASE

/** Study bases: which flow of the A/B study. */
const STUDY_FLOW: Partial<Record<FlowBase, StudyFlow>> = { [STUDY_A_BASE]: "a", [STUDY_B_BASE]: "b" }
export type StudyFlow = "a" | "b"
export type StudyPart = 1 | 2 | 3 | 4

/**
 * Which variant of each unmoderated test the flow uses. The defaults follow each test's hypothesis
 * until the results are in; the moderator can swap any of them with a URL parameter, e.g.
 * /flow?t1=c&t2=a&crumbs=off. Choices stick for the session, so they survive navigation.
 */
export interface FlowConfig {
  /** Test 1 · Settings PDP gallery & details (2 galleries × 3 details placements, A–F) */
  t1: "A" | "B" | "C" | "D" | "E" | "F"
  /** Test 2 · Stone preferences: size, budget or both */
  t2: "A" | "B" | "C"
  /** Test 3.1 · GLP tile opens the PDP (A) or a Quickview (B) */
  t31: "A" | "B"
  /** Test 3.2 · Diamond PDP specs as tiles (A) or a table (B) */
  t32: "A" | "B"
  /** Test 4 · Options on Ring Review (A) or a separate Finishing Touches step (B) */
  t4: "A" | "B"
  /** Breadcrumb (ending in "Design Your Own") on every step */
  crumbs: boolean
}

export const FLOW_DEFAULTS: FlowConfig = { t1: "B", t2: "B", t31: "B", t32: "A", t4: "B", crumbs: true }

/**
 * The study's stone preview per flow (Lucid): Flow A carat first (Test 2 A), Flow B size + budget (Test 2 C).
 * The other tests keep the full flows' defaults.
 */
const BASE_DEFAULTS: Partial<Record<FlowBase, Partial<FlowConfig>>> = { [STUDY_A_BASE]: { t2: "A" }, [STUDY_B_BASE]: { t2: "C" } }
const defaultsFor = (base: FlowBase): FlowConfig => ({ ...FLOW_DEFAULTS, ...BASE_DEFAULTS[base] })

const ALLOWED: Record<Exclude<keyof FlowConfig, "crumbs">, readonly string[]> = {
  t1: ["A", "B", "C", "D", "E", "F"],
  t2: ["A", "B", "C"],
  t31: ["A", "B"],
  t32: ["A", "B"],
  t4: ["A", "B"],
}

/** Session key for a flow's config (/flow keeps its original key). */
const storageKey = (base: FlowBase) => (base === FLOW_BASE ? "dyo-flow-config" : `dyo-flow-config${base}`)

function load(base: FlowBase): FlowConfig {
  try {
    const raw = sessionStorage.getItem(storageKey(base))
    return raw ? { ...defaultsFor(base), ...JSON.parse(raw) } : defaultsFor(base)
  } catch {
    return defaultsFor(base)
  }
}

/** Applies any t1…t4 / crumbs parameters in `search` on top of `config`. */
function fromSearch(config: FlowConfig, search: string): FlowConfig {
  const params = new URLSearchParams(search)
  const next = { ...config }
  for (const key of Object.keys(ALLOWED) as (keyof typeof ALLOWED)[]) {
    const v = params.get(key)?.toUpperCase()
    if (v && ALLOWED[key].includes(v)) (next as Record<string, unknown>)[key] = v
  }
  const crumbs = params.get("crumbs")
  if (crumbs === "off" || crumbs === "on") next.crumbs = crumbs === "on"
  return next
}

interface FlowState {
  /** Which flow: /flow (1/2/3 top bar) or /flow-accordion (accordion steps) */
  base: FlowBase
  config: FlowConfig
  /** Prefixes an in-prototype path with /flow ("/" → the flow's homepage). */
  path: (to: string) => string
  /**
   * Site navigation (header, menus, breadcrumb, logo). From step 2 on it asks first, with the exit modal
   * (Cancel · OK · Save & Navigate Away); before that it just goes.
   */
  leave: (to: string) => void
  /** Stepper View/Edit and the summary's Edit links: back to a step with the build kept. */
  goToStep: (step: "setting" | "stone", mode: "view" | "edit") => void
  /**
   * Stepper "Remove": start that step's choice over. The setting goes back to the engagement ring PLP;
   * with a stone already picked, the journey turns stone-first (stone step 1, setting step 2) and the PLP
   * shows settings for that stone's shape. The stone
   * leaves the build and the shopper goes back to the stone step.
   */
  removeStep: (step: "setting" | "stone") => void
  /** Items in the bag, shown on the header's Bag icon: 1 on the end screen (the ring just added), otherwise 0. */
  bagCount: number
  /** The full-flow study's task (the /study bases only); null in the full flows. */
  study: StudyState | null
}

export interface StudyState {
  flow: StudyFlow
  part: StudyPart
  /** Starts a part (its entry link): stored so a reload stays in the same task. */
  setPart: (part: StudyPart) => void
  /** Ends the task: the end-of-task modal with what the participant chose. */
  endTask: (end: TaskEnd) => void
  /** Part 3: Select on the recommendations points to the full catalog instead (the View All button's label). */
  guideToCatalog: (viewAllLabel: string) => void
}

const partKey = (base: FlowBase) => `dyo-study-part${base}`

function loadPart(base: FlowBase): StudyPart {
  try {
    const n = Number(sessionStorage.getItem(partKey(base)))
    return n >= 1 && n <= 4 ? (n as StudyPart) : 1
  } catch {
    return 1
  }
}

/** Pages past step 1, where leaving would lose the build (stone step, GLP, diamond, finishing, review). */
const BUILD_PAGES = /^\/(stone|diamonds|diamond|finish|review)(\/|$)/

/** Last stone preferences URL query, so "Edit" on the stone returns to the shopper's own preferences. */
export const stoneQueryKey = (base: FlowBase) => (base === FLOW_BASE ? "flow-stone-query" : `flow-stone-query${base}`)

/**
 * The Diamonds PLP's last URL query (with how the shopper got there, `from`), so the Diamond PDP's "Diamonds" crumb
 * returns to the same listing: the breadcrumb one from Shop by Stone, the "Back to stone preferences" one otherwise.
 */
export const plpQueryKey = (base: FlowBase) => `flow-plp-query${base}`

/** The Diamonds PLP's last query; the stone preferences' before any visit. */
// eslint-disable-next-line react-refresh/only-export-components
export function storedPlpQuery(base: FlowBase) {
  try {
    return sessionStorage.getItem(plpQueryKey(base)) ?? storedStoneQuery(base)
  } catch {
    return storedStoneQuery(base)
  }
}

/** The shopper's last stone preferences query ("" before any), for links back into the stone step. */
// eslint-disable-next-line react-refresh/only-export-components
export function storedStoneQuery(base: FlowBase) {
  try {
    return sessionStorage.getItem(stoneQueryKey(base)) ?? ""
  } catch {
    return ""
  }
}

/** Rings saved with "Save & Navigate Away" (the prototype's Wish List). */
const WISHLIST_KEY = "flow-wishlist"

const FlowContext = createContext<FlowState | null>(null)

/** The flow base a path is in, if any. */
const baseOf = (path: string) => BASES.find((b) => path === b || path.startsWith(`${b}/`) || path.startsWith(`${b}?`))

/** Prefixes an in-prototype path with this flow's base ("/" → the flow's homepage); already-prefixed paths pass through. */
const toFlowPathIn = (base: FlowBase) => (to: string) => {
  if (!to.startsWith("/") || baseOf(to)) return to
  return to === "/" ? base : `${base}${to}`
}

/**
 * The header's Shop by Stone links point at the standalone Diamond GLP (/natural-diamonds?shape=…), which has no
 * route inside a flow. In a flow they open the flow's own Diamonds PLP on that shape instead (`from=nav`: the shape
 * alone, none of the stone step's size or budget). Null for any other link.
 */
const flowGlpLink = (to: string) => {
  const url = new URL(to, "http://prototype")
  if (url.pathname !== GLP_PATH) return null
  const shape = url.searchParams.get("shape")
  return `/diamonds?type=natural${shape ? `&shape=${encodeURIComponent(shape)}` : ""}&from=nav`
}

/**
 * The browser tab's title on the flow's own pages, as the PLPs set theirs ("Engagement Rings | Shane Co."), instead
 * of the prototype index's. The PLPs (settings and diamonds) set their own title, so they are left alone.
 */
function flowPageTitle(base: FlowBase, page: string, settingName: string): string | null {
  if (page === "/" || page === "/shop") return "Shane Co. | Engagement Rings, Diamonds & Fine Jewelry"
  // The accordion's steps are one product page (its breadcrumb ends on the setting), so the title is the setting's.
  if (isAccordionBase(base) && /^\/(setting|stone|finish|review)(\/|$)/.test(page)) return settingName
  if (page === "/setting") return settingName
  if (page === "/stone") return "Find Your Stone"
  if (page === "/stone/recommendations") return "Stone Recommendations"
  const diamond = findFlowDiamond(page.match(/^\/diamond\/([^/]+)/)?.[1])
  if (diamond) return diamondName(diamond)
  if (page === "/finish") return "Complete Your Ring"
  if (page === "/review") return "Review Your Ring"
  if (page === "/added") return "Added to Your Bag"
  return null
}

/** Route layout for /flow/* (and /flow-accordion/*): provides the flow context to every page of that flow. */
export function FlowLayout({ base = FLOW_BASE }: { base?: FlowBase }) {
  const toFlowPath = useMemo(() => toFlowPathIn(base), [base])
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { setting, stone, total, reset, shape, hasStone, setStart, setShape, setSettingChosen, clearStone, chosen, start } = useRingBuild()
  const [config, setConfig] = useState<FlowConfig>(() => fromSearch(load(base), search))
  const [pending, setPending] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<number | undefined>(undefined)
  const notInTest = useNotInTest()
  const studyFlow = STUDY_FLOW[base] ?? null
  const [part, setPartState] = useState<StudyPart>(() => loadPart(base))
  const [ended, setEnded] = useState<TaskEnd | null>(null)
  const [guide, setGuide] = useState<string | null>(null)

  useEffect(() => {
    setConfig((c) => {
      const next = fromSearch(c, search)
      return JSON.stringify(next) === JSON.stringify(c) ? c : next
    })
  }, [search])

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(base), JSON.stringify(config))
    } catch {
      /* storage unavailable: the config still works for this page view */
    }
  }, [config, base])

  const go = useCallback(
    (to: string) => {
      navigate(toFlowPath(to))
      window.scrollTo({ top: 0 })
    },
    [navigate, toFlowPath],
  )

  const page = stripFlowBase(pathname)
  useEffect(() => {
    const title = flowPageTitle(base, page, setting.name)
    if (!title) return
    const previous = document.title
    document.title = title.includes("Shane Co.") ? title : `${title} | Shane Co.`
    return () => {
      document.title = previous
    }
  }, [base, page, setting.name])

  const inBuild = BUILD_PAGES.test(page)
  // Only a build with a choice in it (a selected setting or a picked stone) has a customization to lose, so an empty
  // one (e.g. study part 1 browsing Shop by Stone) leaves without the warning.
  const customized = chosen.setting || hasStone
  const leave = useCallback(
    (to: string) => {
      // Shop by Stone stays in the build (the stone step's own catalog), so no exit warning and nothing is reset:
      // the study's fixed setting (parts 2 and 3) carries over.
      const glp = flowGlpLink(to)
      if (glp) return go(glp)
      return inBuild && customized ? setPending(toFlowPath(to)) : go(to)
    },
    [inBuild, customized, go, toFlowPath],
  )

  /**
   * Study parts 2–4 start on a fixed setting (and part 4 on a fixed diamond): changing them isn't part of the task
   * (Lucid: its confirmation modals aren't designed yet), so the stepper and summary links say so instead.
   */
  const lockedInTask = useCallback(
    (step: "setting" | "stone") => {
      if (!studyFlow || part === 1) return false
      if (step === "setting" || part === 4) {
        notInTest(step === "setting" ? "Changing the setting" : "Changing the diamond", "task")
        return true
      }
      return false
    },
    [studyFlow, part, notInTest],
  )

  const goToStep = useCallback<FlowState["goToStep"]>(
    (step, mode) => {
      if (lockedInTask(step)) return
      if (step === "setting") return go("/setting")
      if (mode === "view") return go(`/diamond/${stone.id}`)
      let query = ""
      try {
        query = sessionStorage.getItem(stoneQueryKey(base)) ?? ""
      } catch {
        /* no stored preferences: start from the shape */
      }
      // No stored preferences yet (e.g. a stone picked straight from the GLP): start from the stone's shape.
      go(`/stone${query || `?type=natural&shape=${stone.shape.toLowerCase() || shape || "round"}`}`)
    },
    [go, stone.id, stone.shape, shape, base, lockedInTask],
  )

  // Exit modal actions. OK drops the build; Save keeps it and stores the ring in the Wish List.
  const leaveNow = () => {
    const to = pending
    setPending(null)
    reset()
    if (to) go(to)
  }
  const saveAndLeave = () => {
    const to = pending
    setPending(null)
    try {
      const list = JSON.parse(sessionStorage.getItem(WISHLIST_KEY) ?? "[]") as unknown[]
      list.push({ setting: setting.name, metal: setting.metal, stone: stone.title, total, savedAt: new Date().toISOString() })
      sessionStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
    } catch {
      /* storage unavailable: the confirmation still shows */
    }
    if (to) go(to)
    window.clearTimeout(savedTimer.current)
    setSaved(true)
    savedTimer.current = window.setTimeout(() => setSaved(false), 3200)
  }

  const removeStep = useCallback<FlowState["removeStep"]>(
    (step) => {
      if (lockedInTask(step)) return
      if (step === "stone") {
        // The stone leaves the build (the stepper, summaries and totals stop showing it), then back to the stone
        // step with the shopper's last preferences. A setting still in the build makes the journey setting-first
        // again (setting done, stone next); without one, a stone-first journey stays stone-first.
        clearStone()
        if (start === "stone" && !chosen.setting) setStart("stone")
        return goToStep("stone", "edit")
      }
      setSettingChosen(false)
      // With a stone already picked, the journey turns stone-first: the stone becomes step 1 and the
      // setting step 2, and the PLP previews settings in that stone's shape.
      if (hasStone) {
        setStart("stone")
        setShape(stone.shape.toLowerCase())
        return go(`/engagement-rings?shape=${stone.shape.toLowerCase()}`)
      }
      go("/engagement-rings")
    },
    [go, goToStep, hasStone, setStart, setShape, setSettingChosen, clearStone, start, chosen.setting, stone.shape, lockedInTask],
  )

  const study = useMemo<StudyState | null>(
    () =>
      studyFlow && {
        flow: studyFlow,
        part,
        setPart: (next) => {
          setPartState(next)
          setEnded(null)
          setGuide(null)
          try {
            sessionStorage.setItem(partKey(base), String(next))
          } catch {
            /* storage unavailable: the part holds until a reload */
          }
        },
        endTask: setEnded,
        guideToCatalog: setGuide,
      },
    [studyFlow, part, base],
  )

  const value = useMemo<FlowState>(
    () => ({ base, config, path: toFlowPath, leave, goToStep, removeStep, bagCount: page === "/added" ? 1 : 0, study }),
    [base, config, toFlowPath, leave, goToStep, removeStep, page, study],
  )
  return (
    <FlowContext.Provider value={value}>
      <Outlet />
      <FlowExitModal open={pending !== null} onCancel={() => setPending(null)} onLeave={leaveNow} onSaveAndLeave={saveAndLeave} />
      {studyFlow && (
        <>
          <TaskEndModal end={ended} onClose={() => setEnded(null)} />
          <CatalogGuideModal viewAllLabel={guide} onClose={() => setGuide(null)} />
        </>
      )}
      {/* Saved confirmation on the page the shopper went to (no Figma frame yet: the "not part of this test" notice style). */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-60 flex justify-center px-margin lg:bottom-6">
        {saved && (
          <div className="flex items-center gap-2 bg-primary px-4 py-3 type-caption font-medium text-primary-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <HeartStraightIcon className="size-4" weight="fill" />
            Your ring has been saved to your Wish List
          </div>
        )}
      </div>
    </FlowContext.Provider>
  )
}

/** The flow context, or null outside /flow (the unmoderated tests and other prototypes). */
// eslint-disable-next-line react-refresh/only-export-components
export const useFlow = () => useContext(FlowContext)

/**
 * The step's number in this journey, for "Step N of 3" labels: setting 1 / stone 2, swapped once the full
 * flow turns stone-first (setting removed with a stone picked). Outside the flows it is always setting-first.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useStepNumber(step: "setting" | "stone"): 1 | 2 {
  const flow = useFlow()
  const { start } = useRingBuild()
  const stoneFirst = flow != null && start === "stone"
  return (step === "setting") === stoneFirst ? 2 : 1
}

/**
 * Navigation for site chrome (header, menus, breadcrumb, logo), starting at the top of the page. Inside the
 * flow it goes through the exit guard; elsewhere it is the plain navigate the chrome always did.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSiteNavigate() {
  const flow = useFlow()
  const navigate = useNavigate()
  return (to: string) => {
    if (flow) return flow.leave(to)
    navigate(to)
    window.scrollTo({ top: 0 })
  }
}

/**
 * Whether the site menu (the header's mega menu and Engagement Rings link, the mobile Shop menu) navigates. In the
 * full-flow study only part 1 (Choose a Setting) starts from the homepage and browses; parts 2–4 start on a fixed
 * setting, so the menu says it isn't part of the task. Everywhere else it always navigates.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useMenuNavigation() {
  const flow = useFlow()
  return !flow?.study || flow.study.part === 1
}

/** Maps an in-prototype path into the flow when inside it; identity elsewhere. */
// eslint-disable-next-line react-refresh/only-export-components
export function useFlowPath() {
  const flow = useFlow()
  return flow ? flow.path : (to: string) => to
}

/** Removes the flow prefix (/flow or /flow-accordion), so route logic written for the standalone pages still matches. */
// eslint-disable-next-line react-refresh/only-export-components
export const stripFlowBase = (pathname: string) => {
  const base = baseOf(pathname)
  if (!base) return pathname
  return pathname === base ? "/" : pathname.slice(base.length)
}
