import { STORE } from "@/data/plp"
import { useFlow } from "./flow-context"

/**
 * Full flows: one set of delivery details on every page (setting PDP, diamond PDP and Quickview, Finishing,
 * Review), counted from today so the dates never sit in the past. The ring is made to order, so every page quotes
 * the finished ring: free shipping in 8 business days, $10 faster shipping 2 days sooner, and pickup at the
 * header's store the business day after it ships. Outside the flows (null) each page keeps its Figma copy.
 */
export interface FlowDelivery {
  /** "Thu, Dec 10" */
  shipBy: string
  fasterBy: string
  pickupStore: string
  pickupReady: string
}

const SHIP_DAYS = 8
const FASTER_DAYS = 6

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from)
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) left--
  }
  return d
}

const format = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

export function flowDelivery(today = new Date()): FlowDelivery {
  return {
    shipBy: format(addBusinessDays(today, SHIP_DAYS)),
    fasterBy: format(addBusinessDays(today, FASTER_DAYS)),
    pickupStore: STORE.name,
    pickupReady: format(addBusinessDays(today, SHIP_DAYS + 1)),
  }
}

/** The flows' delivery details, or null outside them. */
export function useFlowDelivery(): FlowDelivery | null {
  return useFlow() ? flowDelivery() : null
}
