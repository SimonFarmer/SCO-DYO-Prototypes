import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  CROWNS,
  DEFAULT_RING_SIZE,
  ENGRAVING,
  SETTING,
  STONE,
  type Crown,
  type EngravingStyle,
  type Stone,
} from "@/data/dyo"

export interface Engraving {
  text: string
  styleId: string
}

interface BuildState {
  ringSize: string | null
  engraving: Engraving | null
  crownId: string | null
  /** Stone chosen in the Stone step (Test 3). Falls back to the pre-chosen STONE. */
  stone: Stone | null
}

export interface LineItem {
  kind: "setting" | "stone" | "crown" | "engraving"
  price: number
}

interface RingBuild extends BuildState {
  setting: typeof SETTING
  stone: Stone
  crown: Crown | null
  engravingStyle: EngravingStyle | null
  lineItems: LineItem[]
  total: number
  setRingSize: (size: string) => void
  setEngraving: (engraving: Engraving | null) => void
  setCrownId: (id: string | null) => void
  setStone: (stone: Stone) => void
  reset: () => void
}

const STORAGE_KEY = "dyo-ring-build"
const INITIAL: BuildState = { ringSize: DEFAULT_RING_SIZE, engraving: null, crownId: null, stone: null }

function load(): BuildState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL
  } catch {
    return INITIAL
  }
}

const RingBuildContext = createContext<RingBuild | null>(null)

/** The ring being built: setting + stone (pre-chosen unless picked in the Stone step) plus finishing touches. */
export function RingBuildProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BuildState>(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable: state still works in memory */
    }
  }, [state])

  const value = useMemo<RingBuild>(() => {
    const stone = state.stone ?? STONE
    const crown = CROWNS.find((c) => c.id === state.crownId) ?? null
    const engravingStyle = state.engraving
      ? (ENGRAVING.styles.find((s) => s.id === state.engraving!.styleId) ?? null)
      : null
    const lineItems: LineItem[] = [
      { kind: "setting", price: SETTING.price },
      { kind: "stone", price: stone.price },
      ...(crown ? [{ kind: "crown" as const, price: crown.price }] : []),
      ...(state.engraving ? [{ kind: "engraving" as const, price: ENGRAVING.price }] : []),
    ]
    return {
      ...state,
      setting: SETTING,
      stone,
      crown,
      engravingStyle,
      lineItems,
      total: lineItems.reduce((sum, item) => sum + item.price, 0),
      setRingSize: (ringSize) => setState((s) => ({ ...s, ringSize })),
      setEngraving: (engraving) => setState((s) => ({ ...s, engraving })),
      setCrownId: (crownId) => setState((s) => ({ ...s, crownId })),
      setStone: (stone) => setState((s) => ({ ...s, stone })),
      reset: () => setState(INITIAL),
    }
  }, [state])

  return <RingBuildContext.Provider value={value}>{children}</RingBuildContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRingBuild() {
  const ctx = useContext(RingBuildContext)
  if (!ctx) throw new Error("useRingBuild must be used inside RingBuildProvider")
  return ctx
}
