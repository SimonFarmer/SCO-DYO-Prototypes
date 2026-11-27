import { Fragment, useState } from "react"
import { useNavigate } from "react-router"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { useFlow } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { formatPrice } from "@/lib/format"
import { cn, PAGE_MAX } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"

type StepNumber = 1 | 2 | 3
type StepKind = "setting" | "stone" | "finishing"
/** Where the shopper entered the DYO flow: a setting (PLP) or a stone (Shop by Stone → diamond GLP). */
export type DyoStart = "setting" | "stone"

/** Step order for each entry point. Finishing touches is always last. */
const ORDER: Record<DyoStart, StepKind[]> = {
  setting: ["setting", "stone", "finishing"],
  stone: ["stone", "setting", "finishing"],
}

const STEP_LABEL: Record<StepKind, string> = { setting: "Setting", stone: "Stone", finishing: "Finishing Touches" }
/** Short labels for the 375px accordion header. */
const STEP_TITLE: Record<StepKind, string> = { setting: "Setting", stone: "Stone", finishing: "Review" }

/** Shown for steps that are current or not started yet (Figma Drop 3b setting step). */
const STEP_DESCRIPTION: Record<StepKind, string> = {
  setting: "Select your setting",
  stone: "Find your perfect stone",
  finishing: "Size, personalize & review",
}

/** Numbered step marker. Done steps get a check badge; the current step is filled. */
function StepMarker({
  n,
  state,
  shape,
  outline = false,
}: {
  n: StepNumber
  state: "done" | "current" | "upcoming"
  shape: "circle" | "square"
  /** Figma "Hero Fix" (8265:100777): a small sans number; steps not current are outlined on white. */
  outline?: boolean
}) {
  if (outline)
    return (
      <span
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center rounded-full type-label-xs tracking-normal",
          state === "current" ? "bg-primary text-primary-foreground" : "border border-input bg-background text-primary",
        )}
      >
        {n}
        {state === "done" && (
          <span className="absolute -right-1 -bottom-1 flex size-3 items-center justify-center rounded-full border border-primary-foreground bg-primary text-primary-foreground">
            <CheckIcon className="size-2" weight="bold" />
          </span>
        )}
      </span>
    )
  return (
    <span
      className={cn(
        // Playfair defaults to old-style figures (1/2/3 at different heights): use lining figures and
        // trim the line box to cap height so each digit sits centred in the circle (Figma: lnum, text-box-trim).
        "relative flex size-8 shrink-0 items-center justify-center font-heading text-2xl leading-8 font-medium tracking-[-0.6px] lining-nums proportional-nums [text-box:trim-both_cap_alphabetic]",
        shape === "circle" && "rounded-full",
        state === "current" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
      )}
    >
      {n}
      {state === "done" && (
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-3 items-center justify-center rounded-full border border-primary-foreground text-primary-foreground",
            // Desktop bar uses primary; the mobile accordion uses the burgundy accent (Figma).
            shape === "circle" ? "bg-primary" : "bg-tertiary"
          )}
        >
          <CheckIcon className="size-2" weight="bold" />
        </span>
      )}
    </span>
  )
}

/**
 * DYO progress stepper.
 * Desktop (lg+): horizontal bar (Test 4 frames). Mobile: accordion (Steps Interface frame).
 * Done steps: in the full flows the chosen item's name opens it and "Remove" starts the step over;
 * in the unmoderated tests they show inert View/Edit links instead.
 */
export function DyoStepper({
  current,
  start = "setting",
  mobileLabel,
  showTotal = true,
  mobileTone = "secondary",
  contained = true,
  columns = false,
}: {
  /** Position of the current step (1–3) in this journey's order. */
  current: StepNumber
  /** Entry point: decides the step order (stone-first puts Stone at step 1). */
  start?: DyoStart
  /** Short label for the 375px accordion header. */
  mobileLabel?: string
  /** Show the running total on step 3 (off on the PLP, before anything is chosen). */
  showTotal?: boolean
  /** Mobile bar style: the PLP strip is secondary with light top and bottom borders (Figma Drop 3b PLP); the tests keep the taller secondary bar. */
  mobileTone?: "secondary" | "plp"
  /** Cap the desktop bar's contents at the page max width (1680px); the bar itself stays full width. */
  contained?: boolean
  /**
   * Desktop bar as Figma "Hero Fix" (8265:100777, the full-flow study's PLP): no "Design Your Ring" title, the three
   * steps as equal full-width columns split by full-height dividers, small outlined numbers, "Your Setting".
   */
  columns?: boolean
}) {
  const { setting, stone, total, start: buildStart, chosen: built, ringSize } = useRingBuild()
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  // Full flow: the name opens the chosen setting/stone, Remove starts the step over. In the tests View/Edit stay inert.
  const flow = useFlow()
  const [open, setOpen] = useState(false)
  // Full flow turned stone-first (the setting removed with a stone picked): pages still say which step they
  // are as in the setting-first order, so place that step in the stone-first order instead.
  if (flow && buildStart === "stone" && start !== "stone") {
    current = (ORDER.stone.indexOf(ORDER.setting[current - 1]) + 1) as StepNumber
    start = "stone"
  }

  const order = ORDER[start]
  // The tests mark steps by position. The full flows mark every step that already holds a choice as done, so going
  // back a step (Edit Setting from the Review, the diamonds PLP) still shows the stone and finishing as done.
  const stateOf = (n: StepNumber) =>
    n === current ? "current" : n < current || (flow && built[order[n - 1]]) ? "done" : "upcoming"
  // Full flows: the current step shows its choice too when it already has one (back on the diamonds PLP, the stone).
  const showsChoice = (n: StepNumber) => {
    const kind = order[n - 1]
    return kind !== "finishing" && (stateOf(n) === "done" || (!!flow && built[kind]))
  }
  const toFinishing = () => {
    if (!flow) return
    navigate(flow.path(FLOW_ROUTES.finish))
    window.scrollTo({ top: 0 })
  }
  const numbered = order.map((kind, i) => ({ kind, n: (i + 1) as StepNumber }))
  const chosen = {
    setting: { price: setting.price, detail: setting.name, lines: [setting.name, setting.metal] },
    stone: { price: stone.price, detail: stone.title, lines: [stone.title] },
    finishing: { price: 0, detail: "", lines: [] as string[] },
  }

  return (
    <>
      {/* Desktop bar (Figma 7336:177134): title column, then three equal steps split by dividers,
          so the steps stretch with the viewport instead of sitting at fixed widths. */}
      {/* Figma "Hero Fix" (columns): no top border, the bar sits straight under the hero. */}
      {/* Its dividers and bottom stroke are one colour, #d5d5d2 (Figma 8265:100777 calls it --input; here that's
          border-subtle, as the hero's divider above). */}
      <div className={cn("hidden border-border-subtle bg-primary-foreground lg:block", columns ? "border-b" : "border-y")}>
      <div className={cn("flex items-center gap-2 px-margin", !columns && "py-3", contained && PAGE_MAX)}>
        {!columns && <p className="w-card shrink-0 type-h5 text-primary">Design Your Ring</p>}
        <ol className={cn("flex min-w-0 flex-1", columns ? "items-stretch" : "items-center gap-4")}>
          {numbered.map(({ kind, n }) => {
            const step = { n, label: STEP_LABEL[kind], ...chosen[kind] }
            const state = stateOf(step.n)
            return (
              <Fragment key={step.n}>
                {step.n > 1 && <li aria-hidden className={cn("w-px self-stretch", columns ? "bg-border-subtle" : "bg-muted", columns && step.n === 2 && "max-2xl:-ml-px")} />}
                <li
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3",
                    // Up to 1680px the first column is as wide as the hero's intro column (w-guided-intent, both
                    // inside the same page gutters), so its divider lines up with the hero's and the three stay
                    // close to equal; on wider screens that would leave it far narrower, so the three are equal.
                    columns && "py-4 pr-4 pl-16 max-2xl:first:pl-12 max-2xl:first:w-guided-intent max-2xl:first:flex-none",
                  )}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <StepMarker n={step.n} state={state} shape="circle" outline={columns} />
                  {showsChoice(step.n) && flow ? (
                    // Full flow: the chosen item's name opens it (was "View"), and "Remove" (was "Edit")
                    // starts that step's choice over.
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-3 type-label-xs text-primary">
                        <span className="flex gap-2">
                          <span>{step.label}:</span>
                          <span>{formatPrice(step.price)}</span>
                        </span>
                        <button type="button" className="cursor-pointer type-label-xs underline" onClick={() => flow.removeStep(kind as "setting" | "stone")}>
                          Remove
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => flow.goToStep(kind as "setting" | "stone", "view")}
                        className="cursor-pointer truncate text-left type-caption font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {step.detail}
                      </button>
                    </div>
                  ) : state === "done" && kind !== "finishing" ? (
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-3 type-label-xs text-primary">
                        <span className="flex gap-2">
                          <span>{step.label}:</span>
                          <span>{formatPrice(step.price)}</span>
                        </span>
                        <button type="button" className="cursor-pointer underline" onClick={() => (flow ? flow.goToStep(kind as "setting" | "stone", "view") : notInTest("Viewing a previous step"))}>
                          View
                        </button>
                        <button type="button" className="cursor-pointer underline" onClick={() => (flow ? flow.goToStep(kind as "setting" | "stone", "edit") : notInTest("Editing a previous step"))}>
                          Edit
                        </button>
                      </div>
                      <p className="truncate type-caption font-medium text-primary">{step.detail}</p>
                    </div>
                  ) : state === "done" && kind === "finishing" && flow ? (
                    // Full flow, step 3 already done (a size chosen) while on an earlier step: back to it.
                    <div className="flex min-w-0 flex-col gap-0.75">
                      <span className="truncate type-label-xs text-primary">{step.label}</span>
                      <button
                        type="button"
                        onClick={toFinishing}
                        className="cursor-pointer truncate text-left type-caption font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {`Size ${ringSize} · ${formatPrice(total)}`}
                      </button>
                    </div>
                  ) : (
                    // Current / upcoming step: title + description, no price.
                    <div className="flex min-w-0 flex-col gap-0.75">
                      <span className="truncate type-label-xs text-primary">{columns && kind === "setting" ? "Your Setting" : step.label}</span>
                      <span className="truncate type-caption text-muted-foreground">{STEP_DESCRIPTION[kind]}</span>
                    </div>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </div>
      </div>

      {/* Mobile accordion: opens over the page, dimming only what's below the bar (not the header or hero above it) */}
      <div
        data-slot="stepper-bar"
        className={cn(
          "sticky top-(--header-offset) z-30 bg-background transition-[top] duration-300 ease-out lg:hidden",
          mobileTone === "secondary" && "border-b border-border-subtle",
        )}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-3 bg-secondary px-margin whitespace-nowrap",
            mobileTone === "plp" ? "h-10 border-y border-border-light" : "h-12",
          )}
        >
          <span className="type-label-xs text-primary">Design Your Own</span>
          <span className="flex min-w-0 items-center gap-2 type-label-xs text-primary">
            <span className="truncate">Step {current}. {mobileLabel ?? STEP_TITLE[order[current - 1]]}</span>
            <CaretDownIcon className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
          </span>
        </button>
        {open && (
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-full h-svh bg-black/40 animate-in fade-in"
          />
        )}
        {open && (
          <ol className="absolute inset-x-0 top-full border-b border-border-subtle bg-background px-margin shadow-lg animate-in fade-in slide-in-from-top-1">
            {numbered.map(({ kind, n }) =>
              kind === "finishing"
                ? { n, kind, label: STEP_LABEL[kind], lines: [STEP_DESCRIPTION[kind]], price: showTotal ? `Total: ${formatPrice(total)}` : "" }
                : showsChoice(n)
                  ? { n, kind, label: STEP_LABEL[kind], lines: chosen[kind].lines, price: formatPrice(chosen[kind].price) }
                  : { n, kind, label: STEP_LABEL[kind], lines: [STEP_DESCRIPTION[kind]], price: "" },
            ).map((step, i, all) => (
              <li
                key={step.n}
                className={cn("flex gap-3 py-4", i < all.length - 1 && "border-b border-muted")}
                aria-current={step.n === current ? "step" : undefined}
              >
                <StepMarker n={step.n} state={stateOf(step.n)} shape="square" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-label-xs text-muted-foreground">{step.label}</span>
                  {step.lines.map((line, li) =>
                    // Full flow: a done step's name opens the chosen setting or stone.
                    flow && li === 0 && showsChoice(step.n) ? (
                      <button
                        key={line}
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          flow.goToStep(step.kind as "setting" | "stone", "view")
                        }}
                        className="cursor-pointer self-start text-left text-xs-2 leading-4 text-primary underline underline-offset-2"
                      >
                        {line}
                      </button>
                    ) : (
                      <span key={line} className="text-xs-2 leading-4 text-primary">
                        {line}
                      </span>
                    ),
                  )}
                  {step.price && <span className="text-xs-2 leading-4 font-semibold text-primary">{step.price}</span>}
                </div>
                {(flow ? showsChoice(step.n) : stateOf(step.n) === "done") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!flow) return notInTest("Editing a previous step")
                      setOpen(false)
                      flow.removeStep(step.kind as "setting" | "stone")
                    }}
                    className="cursor-pointer self-start type-label-xs text-primary underline"
                  >
                    {/* Full flow: "Remove" starts the step over; the tests keep the inert "Edit". */}
                    {flow ? "Remove" : "Edit"}
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  )
}
