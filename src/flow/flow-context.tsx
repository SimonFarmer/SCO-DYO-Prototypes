import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { HeartStraightIcon } from "@phosphor-icons/react"
import { useRingBuild } from "@/state/ring-build"
import { FlowExitModal } from "./exit-modal"

/**
 * Full DYO flow (Test 5, moderated). Every flow page lives under /flow, so the unmoderated tests
 * (/test-1 … /test-4) stay untouched. Shared components read this context to keep links inside
 * the flow; outside it (no provider) they behave exactly as before.
 * Test plan: https://osfdigital.atlassian.net/wiki/spaces/SCO/pages/7887650819 (section 5)
 */
export const FLOW_BASE = "/flow"

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

const ALLOWED: Record<Exclude<keyof FlowConfig, "crumbs">, readonly string[]> = {
  t1: ["A", "B", "C", "D", "E", "F"],
  t2: ["A", "B", "C"],
  t31: ["A", "B"],
  t32: ["A", "B"],
  t4: ["A", "B"],
}

const STORAGE_KEY = "dyo-flow-config"

function load(): FlowConfig {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? { ...FLOW_DEFAULTS, ...JSON.parse(raw) } : FLOW_DEFAULTS
  } catch {
    return FLOW_DEFAULTS
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
}

/** Pages past step 1, where leaving would lose the build (stone step, GLP, diamond, finishing, review). */
const BUILD_PAGES = /^\/(stone|diamonds|diamond|finish|review)(\/|$)/

/** Last stone preferences URL query, so "Edit" on the stone returns to the shopper's own preferences. */
export const FLOW_STONE_QUERY_KEY = "flow-stone-query"

/** Rings saved with "Save & Navigate Away" (the prototype's Wish List). */
const WISHLIST_KEY = "flow-wishlist"

const FlowContext = createContext<FlowState | null>(null)

const toFlowPath = (to: string) => {
  if (!to.startsWith("/") || to === FLOW_BASE || to.startsWith(`${FLOW_BASE}/`) || to.startsWith(`${FLOW_BASE}?`)) return to
  return to === "/" ? FLOW_BASE : `${FLOW_BASE}${to}`
}

/** Route layout for /flow/*: provides the flow context to every flow page. */
export function FlowLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { setting, stone, total, reset, shape } = useRingBuild()
  const [config, setConfig] = useState<FlowConfig>(() => fromSearch(load(), search))
  const [pending, setPending] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setConfig((c) => {
      const next = fromSearch(c, search)
      return JSON.stringify(next) === JSON.stringify(c) ? c : next
    })
  }, [search])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      /* storage unavailable: the config still works for this page view */
    }
  }, [config])

  const go = useCallback(
    (to: string) => {
      navigate(toFlowPath(to))
      window.scrollTo({ top: 0 })
    },
    [navigate],
  )

  const inBuild = BUILD_PAGES.test(stripFlowBase(pathname))
  const leave = useCallback((to: string) => (inBuild ? setPending(toFlowPath(to)) : go(to)), [inBuild, go])

  const goToStep = useCallback<FlowState["goToStep"]>(
    (step, mode) => {
      if (step === "setting") return go("/setting")
      if (mode === "view") return go(`/diamond/${stone.id}`)
      let query = ""
      try {
        query = sessionStorage.getItem(FLOW_STONE_QUERY_KEY) ?? ""
      } catch {
        /* no stored preferences: start from the shape */
      }
      // No stored preferences yet (e.g. a stone picked straight from the GLP): start from the stone's shape.
      go(`/stone${query || `?type=natural&shape=${stone.shape.toLowerCase() || shape || "round"}`}`)
    },
    [go, stone.id, stone.shape, shape],
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

  const value = useMemo<FlowState>(() => ({ config, path: toFlowPath, leave, goToStep }), [config, leave, goToStep])
  return (
    <FlowContext.Provider value={value}>
      <Outlet />
      <FlowExitModal open={pending !== null} onCancel={() => setPending(null)} onLeave={leaveNow} onSaveAndLeave={saveAndLeave} />
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

/** Maps an in-prototype path into the flow when inside it; identity elsewhere. */
// eslint-disable-next-line react-refresh/only-export-components
export function useFlowPath() {
  const flow = useFlow()
  return flow ? flow.path : (to: string) => to
}

/** Removes the /flow prefix, so route logic written for the standalone pages still matches. */
// eslint-disable-next-line react-refresh/only-export-components
export const stripFlowBase = (pathname: string) =>
  pathname === FLOW_BASE ? "/" : pathname.startsWith(`${FLOW_BASE}/`) ? pathname.slice(FLOW_BASE.length) : pathname
