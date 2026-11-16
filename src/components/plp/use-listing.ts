import { useMemo } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router"
import {
  EMPTY_FILTERS,
  PAGE_SIZE,
  PLP_PATH,
  READY_TO_SHIP,
  RTS_PATH,
  SETTINGS,
  applyFilters,
  collectionBySlug,
  sortProducts,
  type FulfilmentId,
  type ListingFilters,
} from "@/data/plp"

const LIST_KEYS = ["style", "shape", "metal", "price", "accent"] as const

function parseFilters(params: URLSearchParams): ListingFilters {
  const list = (k: string) => params.get(k)?.split(",").filter(Boolean) ?? []
  const fulfil = params.get("fulfil")
  return {
    style: list("style"),
    shape: list("shape"),
    metal: list("metal"),
    price: list("price"),
    accent: list("accent"),
    fulfil: fulfil === "instore" || fulfil === "sameday" || fulfil === "friday" ? (fulfil as FulfilmentId) : null,
  }
}

function toQuery(f: ListingFilters, sort: string) {
  const q = new URLSearchParams()
  for (const k of LIST_KEYS) if (f[k].length) q.set(k, f[k].join(","))
  if (f.fulfil) q.set("fulfil", f.fulfil)
  if (sort !== "popular") q.set("sort", sort)
  const s = q.toString()
  return s ? `?${s}` : ""
}

export type ListingMode = "dyo" | "rts"

/**
 * PLP state lives in the URL so every view is linkable from the nav:
 *  /engagement-rings                    Level 2, all settings (DYO step 1)
 *  /engagement-rings?price=under-1000   Level 2 with a preset filter (Shop by Budget)
 *  /engagement-rings/classic            Level 3 landing (title, breadcrumb and hero tile reflect it)
 *  /engagement-rings/ready-to-ship      Ready to Ship preset rings, outside DYO
 * On a Level 3 page, changing any filter moves to Level 2 with the Level 3 filter kept selected
 * (Brilliant Earth pattern), so the shopper is browsing all engagement rings, refined.
 */
export function useListing() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const mode: ListingMode = pathname.startsWith(RTS_PATH) ? "rts" : "dyo"
  const collection = mode === "dyo" ? collectionBySlug(slug) : undefined
  const basePath = mode === "rts" ? RTS_PATH : PLP_PATH
  const sort = params.get("sort") ?? "popular"
  const page = Math.max(1, Number(params.get("page")) || 1)

  const filters = useMemo<ListingFilters>(
    () => (collection ? { ...EMPTY_FILTERS, ...collection.filters } : parseFilters(params)),
    [collection, params],
  )

  const results = useMemo(() => {
    const source = mode === "rts" ? READY_TO_SHIP : SETTINGS
    const base = collection?.only ? source.filter(collection.only) : source
    return sortProducts(applyFilters(base, filters), sort)
  }, [mode, collection, filters, sort])

  /** Result count for pending (not yet applied) filters, for "View N Items" buttons. */
  const countFor = (f: ListingFilters) => {
    const source = mode === "rts" ? READY_TO_SHIP : SETTINGS
    return applyFilters(source, f).length
  }

  /** Apply filters: always lands on Level 2 (this mode's base path), page 1. */
  const setFilters = (next: ListingFilters, nextSort = sort) => {
    navigate(`${basePath}${toQuery(next, nextSort)}`, { preventScrollReset: true })
  }

  const toggle = (key: (typeof LIST_KEYS)[number], value: string) => {
    const has = filters[key].includes(value)
    setFilters({ ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] })
  }

  const setFulfil = (fulfil: FulfilmentId | null) => setFilters({ ...filters, fulfil })

  /** Sort and paging stay on the current page (a Level 3 landing stays Level 3). */
  const setSort = (next: string) => {
    const q = new URLSearchParams(params)
    q.delete("page")
    if (next === "popular") q.delete("sort")
    else q.set("sort", next)
    const s = q.toString()
    navigate(`${pathname}${s ? `?${s}` : ""}`, { preventScrollReset: true })
  }

  const setPage = (next: number) => {
    const q = new URLSearchParams(params)
    if (next === 1) q.delete("page")
    else q.set("page", String(next))
    const s = q.toString()
    navigate(`${pathname}${s ? `?${s}` : ""}`)
  }

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)

  return {
    mode,
    collection,
    filters,
    sort,
    page: current,
    pageCount,
    results,
    pageItems: results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    countFor,
    setFilters,
    toggle,
    setFulfil,
    setSort,
    setPage,
    clearAll: () => setFilters(EMPTY_FILTERS),
  }
}

export type Listing = ReturnType<typeof useListing>
