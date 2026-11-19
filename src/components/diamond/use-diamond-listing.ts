import { useCallback, useEffect, useMemo, useState } from "react"
import { DIAMONDS, type Diamond } from "@/data/diamonds"
import { NO_FILTERS, appliedFilters, matchesFilters, type DiamondFilterState } from "@/lib/diamond-filters"

export const GLP_PAGE_SIZE = 24

export const GLP_SORTS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "carat-desc", label: "Carat: High to Low" },
  { id: "carat-asc", label: "Carat: Low to High" },
] as const
export type GlpSort = (typeof GLP_SORTS)[number]["id"]

const SORTERS: Record<GlpSort, ((a: Diamond, b: Diamond) => number) | null> = {
  popular: null,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "carat-desc": (a, b) => b.carat - a.carat || b.price - a.price,
  "carat-asc": (a, b) => a.carat - b.carat || a.price - b.price,
}

interface SavedState {
  filters: DiamondFilterState
  sort: GlpSort
  page: number
}

/** Keeps the shopper's filters, sort and page for the session, so Quickview → PDP → back returns to the same grid. */
function load(key: string): SavedState {
  try {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<SavedState>
      return { filters: { ...NO_FILTERS, ...saved.filters }, sort: saved.sort ?? "popular", page: saved.page ?? 1 }
    }
  } catch {
    // Storage unavailable: start fresh.
  }
  return { filters: NO_FILTERS, sort: "popular", page: 1 }
}

export const countMatches = (f: DiamondFilterState) => DIAMONDS.reduce((n, d) => (matchesFilters(d, f) ? n + 1 : n), 0)

/** Diamond GLP state: filters, sort and page over the simulated 5,295-stone natural inventory. */
export function useDiamondListing(storageKey = "diamond-glp") {
  const [state, setState] = useState<SavedState>(() => load(storageKey))
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // Ignore: persistence is a convenience.
    }
  }, [state, storageKey])

  const { filters, sort, page } = state
  const results = useMemo(() => {
    const list = DIAMONDS.filter((d) => matchesFilters(d, filters))
    const sorter = SORTERS[sort]
    return sorter ? list.sort(sorter) : list
  }, [filters, sort])

  const pageCount = Math.max(1, Math.ceil(results.length / GLP_PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageItems = results.slice((current - 1) * GLP_PAGE_SIZE, current * GLP_PAGE_SIZE)

  // Any refinement goes back to page 1.
  const setFilters = useCallback((next: DiamondFilterState) => setState((s) => ({ ...s, filters: next, page: 1 })), [])
  const setSort = useCallback((next: GlpSort) => setState((s) => ({ ...s, sort: next, page: 1 })), [])
  const setPage = useCallback((next: number) => setState((s) => ({ ...s, page: next })), [])

  return {
    filters,
    sort,
    page: current,
    pageCount,
    results,
    pageItems,
    activeCount: appliedFilters(filters).length,
    setFilters,
    setSort,
    setPage,
    clearAll: () => setFilters(NO_FILTERS),
    countFor: countMatches,
  }
}

export type DiamondListing = ReturnType<typeof useDiamondListing>
