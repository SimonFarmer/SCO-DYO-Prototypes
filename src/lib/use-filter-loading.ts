import { useEffect, useState } from "react"

/** How long product tiles show their skeleton after a filter or sort change. */
export const FILTER_LOADING_MS = 1000

/**
 * Simulated refresh after the shopper refines a listing. `key` captures the filters (and sort); when it
 * changes, this returns true for `ms`, restarting if it changes again. The first render never loads.
 */
export function useFilterLoading(key: string, ms = FILTER_LOADING_MS) {
  const [seen, setSeen] = useState(key)
  // Bumped on every change, so a second refinement inside the window restarts the timer.
  const [run, setRun] = useState(0)
  if (key !== seen) {
    setSeen(key)
    setRun((r) => r + 1)
  }
  const [doneRun, setDoneRun] = useState(0)
  useEffect(() => {
    if (run === 0) return
    const t = setTimeout(() => setDoneRun(run), ms)
    return () => clearTimeout(t)
  }, [run, ms])
  return run !== doneRun
}
