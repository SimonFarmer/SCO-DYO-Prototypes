import { useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { useFlow } from "@/flow/flow-context"
import { findFlowDiamond } from "@/flow/stone/find-diamond"
import { formatPrice } from "@/lib/format"
import { CompactSections } from "@/components/stones/preference-parts"
import { cn } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"

/*
 * Accordion steps flow · the "Design Your Ring" panel (Lucid "Alternate UX – Accordion steps", wireframes for
 * Setting PDP, Find your Stone, Recommendations, Finishing Touches and Review). One box holds the three steps:
 * a finished step collapses to its summary with Edit, the current step is open with its content, the next
 * steps wait closed; the ring's running total closes the box. Built from the design tokens and the type
 * utilities only (wireframes, no hi-fi yet).
 */

export type StepKey = "setting" | "stone" | "finishing"

/**
 * The last step page the panel showed, and when it last left a page. A panel on a new page within a few
 * seconds of the last one is a step change; arriving on the setting step later (from the PLP) is not.
 */
let lastPanelPath: string | null = null
let panelLeftAt = 0

/** Each step's header: what to do while it's open or ahead ("Select your setting"), what was chosen once done. */
const STEPS: { key: StepKey; n: 1 | 2 | 3; label: string; done: string }[] = [
  { key: "setting", n: 1, label: "Select your setting", done: "Your setting" },
  { key: "stone", n: 2, label: "Find your perfect stone", done: "Your stone" },
  { key: "finishing", n: 3, label: "Finishing Touches", done: "Your finishing touches" },
]

/** Step marker: done = filled with a check; current = filled with the number; upcoming = outlined number. */
function Marker({ n, state }: { n: 1 | 2 | 3; state: "done" | "current" | "upcoming" }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full type-label-xs",
        state === "upcoming" ? "border border-border-subtle bg-background text-primary" : "bg-primary text-primary-foreground",
      )}
      aria-hidden
    >
      {state === "done" ? <CheckIcon className="size-3.5" weight="bold" /> : n}
    </span>
  )
}

/** Header row (Figma 8224:180625): marker, the step in caps, the caret on the right. */
function StepHeader({ n, state, label }: { n: 1 | 2 | 3; state: "done" | "current" | "upcoming"; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Marker n={n} state={state} />
        <p className="type-label-xs text-primary">{label}</p>
      </div>
      <CaretDownIcon className="size-6 shrink-0 text-primary" aria-hidden />
    </div>
  )
}

/** A summary line in a finished step: thumbnail (or a short token such as the ring size), name, details. */
export function SummaryItem({ thumb, token, title, detail }: { thumb?: string; token?: string; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-13 shrink-0 items-center justify-center overflow-hidden bg-secondary">
        {thumb ? <img src={thumb} alt="" className="size-full object-cover" /> : <span className="text-xs font-semibold text-primary">{token}</span>}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm leading-5 font-semibold text-primary">{title}</p>
        <p className="type-caption text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

function EditLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Edit ${label}`} className="shrink-0 cursor-pointer type-label-xs text-primary underline">
      Edit
    </button>
  )
}

/** What a finished step shows: the choice made in it. */
function DoneSummary({ step }: { step: StepKey }) {
  const { setting, stone, ringSize, engraving, engravingStyle, crown, band, bandEngraving } = useRingBuild()
  if (step === "setting") return <SummaryItem thumb={setting.image} title={setting.name} detail={`${setting.metal} · ${formatPrice(setting.price)}`} />
  if (step === "stone") {
    const photo = findFlowDiamond(stone.id)?.image
    return <SummaryItem thumb={photo} token="◇" title={stone.title} detail={`${stone.clarity} · ${stone.color} · ${stone.cut} · ${formatPrice(stone.price)}`} />
  }
  return (
    <div className="flex flex-col gap-4">
      <SummaryItem token={ringSize ?? "—"} title={ringSize ? `Ring size ${ringSize}` : "Ring size not selected"} detail="Resizing is free, for life" />
      {engraving && (
        <SummaryItem token="Abc" title={`Engraving: “${engraving.text}”`} detail={`${engravingStyle?.name ?? "Engraving"} · inside the band · ${formatPrice(60)}`} />
      )}
      {crown && <SummaryItem thumb={crown.image} title={crown.name} detail={`${crown.holds} · ${formatPrice(crown.price)}`} />}
      {band && <SummaryItem thumb={band.image} title={band.name} detail={`${band.metal} · ${formatPrice(band.price)}${bandEngraving ? " · engraved" : ""}`} />}
    </div>
  )
}

/** Ring Summary under the steps (Figma 8224:180625): price lines, divider, the total. */
export function PanelTotals({ rows, totalLabel, total }: { rows: { label: string; value: string }[]; totalLabel: string; total: string }) {
  return (
    <div className="flex flex-col gap-4 bg-bg-input-50 p-4" aria-live="polite">
      <h2 className="type-h4 text-primary">Ring Summary</h2>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4">
            <span className="text-xs leading-4 font-medium text-primary">{r.label}</span>
            <span className="text-sm leading-none font-semibold whitespace-nowrap text-muted-foreground">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border-subtle" />
      <div className="flex items-start justify-between gap-4 text-base leading-6 font-semibold text-primary">
        <span>{totalLabel}:</span>
        <span className="whitespace-nowrap">{total}</span>
      </div>
    </div>
  )
}

/**
 * The panel. `current` is the open step ("review" = every step finished, as on Review Your Ring); `children`
 * is the open step's content; `summary` follows the box (the Ring Summary); `footer` closes the box (the
 * review's total and actions).
 */
export function BuildPanel({ current, children, summary, footer }: { current: StepKey | "review"; children?: ReactNode; summary?: ReactNode; footer?: ReactNode }) {
  const flow = useFlow()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sectionRef = useRef<HTMLElement>(null)
  const currentRef = useRef<HTMLLIElement>(null)
  const index = current === "review" ? 3 : STEPS.findIndex((s) => s.key === current)
  const isReview = current === "review"
  // Moving between steps (or from preferences to recommendations) brings the open step into view, smoothly:
  // the panel sits under the gallery on phones and holds finished steps above on desktop. Skipped when the
  // step's heading is already in the upper half of the screen.
  useEffect(() => {
    const prev = lastPanelPath
    lastPanelPath = pathname
    // Same page again (a re-render, or React's dev double-mount): nothing to do.
    if (prev === pathname) return
    const el = current === "review" ? sectionRef.current : currentRef.current
    // Arriving on the setting step from the PLP shows the gallery first; coming back to it from a step scrolls.
    const stepChange = prev !== null && performance.now() - panelLeftAt < 3000
    if (!el || (current === "setting" && !stepChange)) return
    requestAnimationFrame(() => {
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-offset")) || 0
      const top = el.getBoundingClientRect().top
      if (top >= offset && top <= window.innerHeight / 2) return
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      window.scrollTo({ top: Math.max(0, top + window.scrollY - offset - 16), behavior: reduce ? "auto" : "smooth" })
    })
  }, [current, pathname])

  useEffect(
    () => () => {
      panelLeftAt = performance.now()
    },
    [],
  )

  // Whether the open step's sticky title is pinned: it sits at the header offset while its step's top has
  // scrolled above it.
  const headRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    let frame = 0
    const check = () => {
      frame = 0
      const head = headRef.current
      const step = currentRef.current
      if (!head || !step) return setStuck(false)
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-offset")) || 0
      setStuck(step.getBoundingClientRect().top < offset - 1 && head.getBoundingClientRect().bottom > offset + 1)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    // The site header showing or hiding moves the title (its `top` eases), so check again once that settles.
    const head = headRef.current
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    head?.addEventListener("transitionend", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      head?.removeEventListener("transitionend", onScroll)
    }
  }, [current])

  const edit = (step: StepKey) => {
    if (!flow) return
    if (step === "finishing") {
      navigate(flow.path("/finish"))
      window.scrollTo({ top: 0 })
    }
    else flow.goToStep(step, "edit")
  }

  return (
    <section ref={sectionRef} aria-label="Design your ring" className="flex scroll-mt-4 flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="type-h3 text-primary">{isReview ? "Review Your Ring" : "Design Your Ring"}</h1>
        <p className="shrink-0 type-label-xs whitespace-nowrap text-primary">{isReview ? "All 3 steps complete" : `Step ${index + 1} of 3`}</p>
      </div>
      {/* On phones the steps run edge to edge (rules and tints full width, content on the page margin), so
          the open step gets the screen's width; from lg they sit in a bordered box. */}
      <ol className="-mx-margin flex flex-col border-t border-border-subtle lg:mx-0 lg:border">
        {STEPS.map((s, i) => {
          const state = i < index ? "done" : i === index ? "current" : "upcoming"
          return (
            <li
              key={s.key}
              ref={state === "current" ? currentRef : undefined}
              className={cn("border-b border-border-subtle", !footer && "last:border-b-0", state === "upcoming" && "bg-bg-input-50")}
              aria-current={state === "current" ? "step" : undefined}
            >
              {state === "done" ? (
                // A step just finished settles into its summary, with Edit beside it.
                <div className="flex flex-col gap-4 px-margin py-6 animate-in fade-in duration-300 motion-reduce:animate-none lg:p-6">
                  <StepHeader n={s.n} state="done" label={s.done} />
                  <div className="flex items-start justify-between gap-4">
                    <DoneSummary step={s.key} />
                    <EditLink onClick={() => edit(s.key)} label={s.done.replace(/^Your /, "")} />
                  </div>
                </div>
              ) : state === "current" ? (
                <div className="flex flex-col px-margin pb-6 lg:px-6">
                  {/* The open step's title stays pinned under the site header while its content scrolls past,
                      until the step ends; a hairline shadow shows once it is stuck. */}
                  <div
                    ref={headRef}
                    className={cn(
                      "sticky top-(--header-offset) z-10 -mx-margin bg-background px-margin pt-6 pb-4 lg:-mx-6 lg:px-6 transition-[top,box-shadow] duration-300 ease-out",
                      stuck && "shadow-2xs",
                    )}
                  >
                    <StepHeader n={s.n} state="current" label={s.label} />
                  </div>
                  {/* The open step's content eases in (keyed by page, so 2a → 2b animates too). */}
                  <div key={pathname} className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300 ease-out motion-reduce:animate-none">
                    <CompactSections.Provider value={true}>{children}</CompactSections.Provider>
                  </div>
                </div>
              ) : (
                // Later steps open once the current one is done.
                <div className="px-margin py-4 lg:px-6" aria-disabled>
                  <StepHeader n={s.n} state="upcoming" label={s.label} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
      {/* The box continues around the review's total and actions; the Ring Summary sits under it. */}
      {footer && <div className="-mx-margin -mt-6 border-b border-border-subtle lg:mx-0 lg:border-x">{footer}</div>}
      {summary}
    </section>
  )
}
