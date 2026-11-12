import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router"
import {
  CROWNS,
  DEFAULT_RING_SIZE,
  ENGRAVING,
  SETTING,
  STONE,
  WEDDING_BANDS,
  type Crown,
  type EngravingStyle,
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
}

export interface LineItem {
  kind: "setting" | "stone" | "crown" | "engraving" | "band" | "band-engraving"
  price: number
}

interface RingBuild extends BuildState {
  setting: typeof SETTING
  stone: typeof STONE
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
  reset: () => void
  /** Clears both variants' builds (used when launching a prototype from the index). */
  resetAll: () => void
}

type BuildKey = "A" | "B"

/**
 * Starting state per variant, following the Figma frames:
 * A (Ring Review) shows size 6.5 preselected; B (Finishing Touches) starts with no size.
 */
const INITIAL: Record<BuildKey, BuildState> = {
  A: { ringSize: DEFAULT_RING_SIZE, engraving: null, crownId: null, bandId: null, bandEngraving: null },
  B: { ringSize: null, engraving: null, crownId: null, bandId: null, bandEngraving: null },
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
 * The ring being built: setting + stone (pre-chosen) plus finishing touches.
 * Each variant keeps its own build (keyed by ?variant=), so switching variants never leaks choices.
 */
export function RingBuildProvider({ children }: { children: ReactNode }) {
  const [params] = useSearchParams()
  const key: BuildKey = params.get("variant")?.toUpperCase() === "B" ? "B" : "A"
  const [builds, setBuilds] = useState<Record<BuildKey, BuildState>>(() => ({ A: load("A"), B: load("B") }))
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
    const crown = CROWNS.find((c) => c.id === state.crownId) ?? null
    const styleOf = (e: Engraving | null) => (e ? (ENGRAVING.styles.find((s) => s.id === e.styleId) ?? null) : null)
    const engravingStyle = styleOf(state.engraving)
    const band = WEDDING_BANDS.find((b) => b.id === state.bandId) ?? null
    const bandEngraving = band ? state.bandEngraving : null
    const lineItems: LineItem[] = [
      { kind: "setting", price: SETTING.price },
      { kind: "stone", price: STONE.price },
      ...(crown ? [{ kind: "crown" as const, price: crown.price }] : []),
      ...(state.engraving ? [{ kind: "engraving" as const, price: ENGRAVING.price }] : []),
      ...(band ? [{ kind: "band" as const, price: band.price }] : []),
      ...(bandEngraving ? [{ kind: "band-engraving" as const, price: ENGRAVING.price }] : []),
    ]
    return {
      ...state,
      setting: SETTING,
      stone: STONE,
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
