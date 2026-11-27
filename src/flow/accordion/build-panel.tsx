import { useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"
import { PriceExplainedPopover } from "@/components/shared/price-explained-popover"
import { CompactSections, SlideNote } from "@/components/stones/preference-parts"
import { useFlow } from "@/flow/flow-context"
import { cn } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"

/*
 * Accordion steps flow · the "Design Your Own Ring" panel (Figma "Exploration — Accordion customiser v2",
 * 7541:332655). The title with the running ring total, then the three steps as rows: a numbered circle, the
 * step's name and a one-line summary, a caret. The open step's content sits under its row, indented to the
 * name; a price box (the "Price Explained" breakdown) follows the steps.
 */

export type StepKey = "setting" | "stone" | "finishing"

/**
 * The last step page the panel showed, and when it last left a page. A panel on a new page within a few
 * seconds of the last one is a step change; arriving on the setting step later (from the PLP) is not.
 */
let lastPanelPath: string | null = null
let panelLeftAt = 0

const STEP_NAMES: Record<StepKey, string> = { setting: "Setting", stone: "Stone", finishing: "Finishing Touches" }

/**
 * The journey's step order: setting first, or stone first once the setting was removed with a stone already
 * picked (the stone becomes step 1 and the setting step 2).
 */
function stepsFor(start: "setting" | "stone" | null | undefined) {
  const order: StepKey[] = start === "stone" ? ["stone", "setting", "finishing"] : ["setting", "stone", "finishing"]
  return order.map((key, i) => ({ key, n: i + 1, name: STEP_NAMES[key] }))
}

/** The one-line summary under each step's name (Figma 7549:388516): the choice once made, otherwise what the step does. */
function useStepSummaries(done: (key: StepKey) => boolean): Record<StepKey, string> {
  const { setting, stone, ringSize, engraving, crown, band } = useRingBuild()
  const finishing = [
    ringSize && `Size ${ringSize}`,
    engraving && `Engraving: “${engraving.text}”`,
    crown && crown.name,
    band && band.name,
  ].filter(Boolean)
  return {
    setting: `${setting.name.replace(/ Engagement Ring$/, "")} · ${setting.metal}`,
    stone: done("stone") ? `${stone.title} · ${stone.color} · ${stone.clarity} · ${stone.cut}` : "Tell us what you're looking for and we'll recommend stones",
    finishing: done("finishing") && finishing.length ? finishing.join(" · ") : "Size, personalize & review",
  }
}

/** A price line in the box: the label in caps, the choice and its price under it (Figma 7549:388533). */
export interface PriceLine {
  label: string
  desc: ReactNode
  value?: string
  /** Over budget (Size + Budget, full-flow study): the price in red with `note` (red) under the line. Pass `note` as null to keep its slot. */
  over?: boolean
  note?: ReactNode
}

/** The price breakdown (Figma "Price Explained — Popover", 7549:388533): lines, a rule, the ring total. */
export function PriceBox({ lines, total, className }: { lines: PriceLine[]; total: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 bg-bg-input-50 p-4 text-primary", className)} aria-live="polite">
      {lines.map((l) => (
        <div key={l.label} className="flex flex-col gap-0.75">
          <p className="type-label-xs">{l.label}</p>
          <div className="flex items-start gap-2 type-caption">
            <p className="min-w-0 flex-1 tracking-[0.12px]">{l.desc}</p>
            {l.value && <p className={cn("shrink-0 text-right font-semibold whitespace-nowrap", l.over && "text-tertiary")}>{l.value}</p>}
          </div>
          {l.note !== undefined && <SlideNote>{l.note}</SlideNote>}
        </div>
      ))}
      <div className="h-px bg-input" />
      <div className="flex items-start justify-between gap-2 text-sm leading-5 font-semibold">
        <p>Ring Total:</p>
        <p className="whitespace-nowrap">{total}</p>
      </div>
    </div>
  )
}

/** Numbered circle: the open step's is drawn heavier (Figma 7549:387038). */
function StepNumber({ n, open }: { n: number; open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] leading-4 font-semibold tracking-[1px] text-primary",
        open ? "border-2 border-primary" : "border border-input",
      )}
    >
      {n}
    </span>
  )
}

/**
 * A step's row: number, name and summary, caret (up while open). With `onOpen` (a finished step) the row is a
 * button that opens the step again; `aside` sits before the caret (the "Remove" link).
 */
function StepRow({ n, name, summary, open, onOpen, aside }: { n: number; name: string; summary: string; open: boolean; onOpen?: () => void; aside?: ReactNode }) {
  const Caret = open ? CaretUpIcon : CaretDownIcon
  // A finished step's name and choice underline on hover (with the row's tint), so it reads as clickable.
  const hover = onOpen ? "underline-offset-4 decoration-1 group-hover/row:underline" : undefined
  const body = (
    <>
      <StepNumber n={n} open={open} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-base leading-6 font-semibold text-primary", hover)}>{name}</span>
        <span className={cn("text-xs leading-4 font-medium text-muted-foreground", hover)}>{summary}</span>
      </span>
    </>
  )
  return (
    <div className="flex items-center gap-4 text-left">
      {onOpen ? (
        <button type="button" onClick={onOpen} aria-label={`${name}: ${summary}. Change`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      {aside}
      {onOpen ? (
        <button type="button" onClick={onOpen} tabIndex={-1} aria-hidden className="shrink-0 cursor-pointer">
          <Caret className="size-6 text-primary" />
        </button>
      ) : (
        <Caret className="size-6 shrink-0 text-primary" aria-hidden />
      )}
    </div>
  )
}

/**
 * The panel. `current` is the open step ("review" = every step finished and closed); `children` is the open
 * step's content; `lines` and `total` fill the price box (and the "Price explained" popover); `ringTotal` is the
 * header's figure; `footer` follows the price box (the review's actions).
 */
export function BuildPanel({
  current,
  ringTotal,
  lines,
  total,
  children,
  footer,
}: {
  current: StepKey | "review"
  ringTotal: string
  lines: PriceLine[]
  total: string
  children?: ReactNode
  footer?: ReactNode
}) {
  const flow = useFlow()
  const navigate = useNavigate()
  // The recommendations modal opens over the stone step: same step, so no scroll or re-animation behind it.
  const pathname = useLocation().pathname.replace(/\/recommendations$/, "")
  const { start, chosen } = useRingBuild()
  const steps = stepsFor(start)
  const index = current === "review" ? steps.length : steps.findIndex((s) => s.key === current)
  // Done: before the open step, or already chosen in the build (going back to the setting keeps the stone done).
  const isDone = (key: StepKey) => key !== current && (steps.findIndex((s) => s.key === key) < index || chosen[key])
  const summaries = useStepSummaries(isDone)
  const sectionRef = useRef<HTMLElement>(null)
  const currentRef = useRef<HTMLLIElement>(null)

  // Moving between steps brings the open step into view, smoothly (the panel sits under the gallery on phones).
  // Skipped when the step's row is already in the upper half of the screen.
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

  // Whether the open step's sticky row is pinned: it sits at the header offset while its step's top has
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
    // The site header showing or hiding moves the row (its `top` eases), so check again once that settles.
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

  /** A closed step's row opens that step again: the setting and the stone go back to their step, finishing to step 3. */
  const reopen = (step: StepKey) => {
    if (!flow) return
    if (step === "finishing") {
      navigate(flow.path("/finish"))
      window.scrollTo({ top: 0 })
    } else flow.goToStep(step, "edit")
  }

  return (
    <section ref={sectionRef} aria-label="Design your own ring" className="flex scroll-mt-4 flex-col gap-8">
      {/* Title and running total (Figma 7541:341919). */}
      <div className="flex flex-col gap-4 text-primary">
        <h1 className="type-h2">Design Your Own Ring</h1>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-lg leading-7 font-semibold">Ring Total: {ringTotal}</p>
          <span className="text-sm leading-none font-medium text-muted-foreground" aria-hidden>
            ∙
          </span>
          <PriceExplainedPopover
            align="start"
            rows={lines.map((l) => ({ label: l.label, name: l.desc, price: l.value }))}
            total={total}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <ol className="flex flex-col">
          {steps.map((s) => {
            const open = s.key === current
            const done = isDone(s.key)
            const summary = summaries[s.key]
            return (
              <li
                key={s.key}
                ref={open ? currentRef : undefined}
                className="border-b border-muted first:border-t"
                aria-current={open ? "step" : undefined}
              >
                {open ? (
                  <div className="flex flex-col pb-4">
                    {/* The open step's row stays pinned under the site header while its content scrolls past, until
                        the step ends; a hairline shadow shows once it is stuck. */}
                    <div
                      ref={headRef}
                      className={cn(
                        "sticky top-(--header-offset) z-10 -mx-margin bg-background px-margin py-5 transition-[top,box-shadow] duration-300 ease-out lg:-mx-2 lg:px-2",
                        stuck && "shadow-2xs",
                      )}
                    >
                      <StepRow n={s.n} name={s.name} summary={summary} open />
                    </div>
                    {/* Indented to the step's name on desktop (Figma 7549:387046: 44px; phones keep the full width); eases in, keyed by page. */}
                    <div
                      key={pathname}
                      className="flex flex-col gap-8 pt-3 lg:pl-11 animate-in fade-in slide-in-from-top-2 duration-300 ease-out motion-reduce:animate-none"
                    >
                      <CompactSections.Provider value={true}>{children}</CompactSections.Provider>
                    </div>
                  </div>
                ) : done && flow ? (
                  // A finished step: its row opens it again; the setting and the stone can also be removed.
                  <div className="group/row -mx-2 px-2 py-5 transition-colors duration-150 hover:bg-bg-input-50">
                    <StepRow
                      n={s.n}
                      name={s.name}
                      summary={summary}
                      open={false}
                      onOpen={() => reopen(s.key)}
                      aside={
                        s.key !== "finishing" && (
                          <button
                            type="button"
                            onClick={() => flow.removeStep(s.key as "setting" | "stone")}
                            aria-label={`Remove ${s.name.toLowerCase()}`}
                            className="shrink-0 cursor-pointer type-label-xs text-primary underline"
                          >
                            Remove
                          </button>
                        )
                      }
                    />
                  </div>
                ) : (
                  // Later steps open once the current one is done.
                  <div className="py-5" aria-disabled>
                    <StepRow n={s.n} name={s.name} summary={summary} open={false} />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
        <PriceBox lines={lines} total={total} />
        {footer}
      </div>
    </section>
  )
}
