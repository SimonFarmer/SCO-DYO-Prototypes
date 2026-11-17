import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useLocation } from "react-router"
import {
  CROWNS,
  DEFAULT_RING_SIZE,
  ENGRAVING,
  SETTING,
  STONE,
  WEDDING_BANDS,
  type Crown,
  type EngravingStyle,
  type Stone,
  type WeddingBand,
} from "@/data/dyo"

export interface Engraving {
  text: string
  styleId: string
}

interface BuildState {
  ringSize: string | null
  engraving: Engraving | null
  crownId: string | null
  /** Matching wedding band (Test 4 · B) and the band's own engraving. */
  bandId: string | null
  bandEngraving: Engraving | null
  /** Stone chosen in the Stone step (Test 3). Falls back to the pre-chosen STONE. */
  stone: Stone | null
}

export interface LineItem {
  kind: "setting" | "stone" | "crown" | "engraving" | "band" | "band-engraving"
  price: number
}

interface RingBuild extends BuildState {
  setting: typeof SETTING
  stone: Stone
  crown: Crown | null
  engravingStyle: EngravingStyle | null
  band: WeddingBand | null
  bandEngravingStyle: EngravingStyle | null
  lineItems: LineItem[]
  total: number
  setRingSize: (size: string) => void
  setEngraving: (engraving: Engraving | null) => void
  setCrownId: (id: string | null) => void
  /** Removing the band also removes its engraving. */
  setBandId: (id: string | null) => void
  setBandEngraving: (engraving: Engraving | null) => void
  setStone: (stone: Stone) => void
  reset: () => void
  /** Clears every build (used when launching a prototype from the index). */
  resetAll: () => void
}

/** A and B are Test 4's variants; T3 is Test 3's own build, so a stone picked there never shows up in Test 4. */
type BuildKey = "A" | "B" | "T3"

/**
 * Starting state per build, following the Figma frames:
 * A (Ring Review) shows size 6.5 preselected; B (Finishing Touches) starts with no size.
 */
const INITIAL: Record<BuildKey, BuildState> = {
  A: { ringSize: DEFAULT_RING_SIZE, engraving: null, crownId: null, bandId: null, bandEngraving: null, stone: null },
  B: { ringSize: null, engraving: null, crownId: null, bandId: null, bandEngraving: null, stone: null },
  T3: { ringSize: DEFAULT_RING_SIZE, engraving: null, crownId: null, bandId: null, bandEngraving: null, stone: null },
}

/**
 * Which build the current URL uses. Variants live in the path (/test-4/b, /test-4/b/review);
 * older ?variant=B links still resolve to B.
 */
function buildKeyFor(pathname: string, search: string): BuildKey {
  if (/^\/test-3/.test(pathname)) return "T3"
  const fromPath = pathname.match(/^\/test-4\/([ab])(?:\/|$)/i)?.[1]
  const variant = (fromPath ?? new URLSearchParams(search).get("variant"))?.toUpperCase()
  return variant === "B" ? "B" : "A"
}

const storageKey = (key: BuildKey) => `dyo-ring-build-${key}`

function load(key: BuildKey): BuildState {
  try {
    const raw = sessionStorage.getItem(storageKey(key))
    return raw ? { ...INITIAL[key], ...JSON.parse(raw) } : INITIAL[key]
  } catch {
    return INITIAL[key]
  }
}

const RingBuildContext = createContext<RingBuild | null>(null)

/**
 * The ring being built: setting + stone (pre-chosen unless picked in the Stone step) plus finishing touches.
 * Each variant keeps its own build (see buildKeyFor), so switching variants never leaks choices.
 */
export function RingBuildProvider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation()
  const key = buildKeyFor(pathname, search)
  const [builds, setBuilds] = useState<Record<BuildKey, BuildState>>(() => ({ A: load("A"), B: load("B"), T3: load("T3") }))
  const state = builds[key]

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(key), JSON.stringify(state))
    } catch {
      /* storage unavailable: state still works in memory */
    }
  }, [key, state])

  const value = useMemo<RingBuild>(() => {
    const update = (patch: Partial<BuildState>) => setBuilds((b) => ({ ...b, [key]: { ...b[key], ...patch } }))
    const stone = state.stone ?? STONE
    const crown = CROWNS.find((c) => c.id === state.crownId) ?? null
    const styleOf = (e: Engraving | null) => (e ? (ENGRAVING.styles.find((s) => s.id === e.styleId) ?? null) : null)
    const engravingStyle = styleOf(state.engraving)
    const band = WEDDING_BANDS.find((b) => b.id === state.bandId) ?? null
    const bandEngraving = band ? state.bandEngraving : null
    const lineItems: LineItem[] = [
      { kind: "setting", price: SETTING.price },
      { kind: "stone", price: stone.price },
      ...(crown ? [{ kind: "crown" as const, price: crown.price }] : []),
      ...(state.engraving ? [{ kind: "engraving" as const, price: ENGRAVING.price }] : []),
      ...(band ? [{ kind: "band" as const, price: band.price }] : []),
      ...(bandEngraving ? [{ kind: "band-engraving" as const, price: ENGRAVING.price }] : []),
    ]
    return {
      ...state,
      setting: SETTING,
      stone,
      crown,
      engravingStyle,
      bandEngraving,
      band,
      bandEngravingStyle: styleOf(bandEngraving),
      lineItems,
      total: lineItems.reduce((sum, item) => sum + item.price, 0),
      setRingSize: (ringSize) => update({ ringSize }),
      setEngraving: (engraving) => update({ engraving }),
      setCrownId: (crownId) => update({ crownId }),
      setBandId: (bandId) => update(bandId ? { bandId } : { bandId: null, bandEngraving: null }),
      setBandEngraving: (bandEngraving) => update({ bandEngraving }),
      setStone: (stone) => update({ stone }),
      reset: () => update(INITIAL[key]),
      resetAll: () => setBuilds(INITIAL),
    }
  }, [key, state])

  return <RingBuildContext.Provider value={value}>{children}</RingBuildContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRingBuild() {
  const ctx = useContext(RingBuildContext)
  if (!ctx) throw new Error("useRingBuild must be used inside RingBuildProvider")
  return ctx
}
