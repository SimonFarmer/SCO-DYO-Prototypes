import { useSyncExternalStore } from "react"
import { useSearchParams } from "react-router"

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

/** Reads ?variant=X, falling back to the first allowed variant. */
export function useVariant<T extends string>(allowed: readonly T[]): T {
  const [params] = useSearchParams()
  const v = params.get("variant")?.toUpperCase()
  return (allowed as readonly string[]).includes(v ?? "") ? (v as T) : allowed[0]
}
