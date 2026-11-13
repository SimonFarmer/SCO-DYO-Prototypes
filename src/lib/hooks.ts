import { useSyncExternalStore } from "react"
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
