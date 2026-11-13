import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react"
import { useParams, useSearchParams } from "react-router"

/** Matches a CSS media query, e.g. useMediaQuery("(min-width: 80rem)"). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/** Desktop layout = the `lg` breakpoint (Figma 1280px viewport). */
export const useIsDesktop = () => useMediaQuery("(min-width: 80rem)")

/**
 * Reads the variant from the path (`/test-1/b`, the participant URL) or `?variant=B`,
 * falling back to the first allowed variant.
 */
export function useVariant<T extends string>(allowed: readonly T[]): T {
  const { variant: fromPath } = useParams()
  const [params] = useSearchParams()
  const v = (fromPath ?? params.get("variant"))?.toUpperCase()
  return (allowed as readonly string[]).includes(v ?? "") ? (v as T) : allowed[0]
}

/**
 * Tracks whether a horizontal scroller overflows and whether it can scroll either way,
 * so carousel controls can hide when everything fits and disable at either end.
 */
export function useScrollOverflow(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ overflows: false, canPrev: false, canNext: false })
  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const overflows = el.scrollWidth > el.clientWidth + 1
    const canPrev = el.scrollLeft > 1
    const canNext = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setState((s) => (s.overflows === overflows && s.canPrev === canPrev && s.canNext === canNext ? s : { overflows, canPrev, canNext }))
  }, [ref])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    el.addEventListener("scroll", update, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", update)
    }
  }, [ref, update])
  return state
}
