import { Fragment, useState } from "react"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useRingBuild } from "@/state/ring-build"

type StepNumber = 1 | 2 | 3

/** Shown for steps that are current or not started yet (Figma Drop 3b setting step). */
const STEP_DESCRIPTION: Record<StepNumber, string> = {
  1: "Select your setting",
  2: "Find your perfect stone",
  3: "Size, personalize & review",
}

/** Numbered step marker. Done steps get a check badge; the current step is filled. */
function StepMarker({
  n,
  state,
  shape,
}: {
  n: StepNumber
  state: "done" | "current" | "upcoming"
  shape: "circle" | "square"
}) {
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
 * View/Edit links are inert in the unmoderated tests.
 */
export function DyoStepper({ current, mobileLabel }: { current: StepNumber; /** Short label for the 375px accordion header. */ mobileLabel?: string }) {
  const { setting, stone, total } = useRingBuild()
  const notInTest = useNotInTest()
  const [open, setOpen] = useState(false)

  const stateOf = (n: StepNumber) => (n < current ? "done" : n === current ? "current" : "upcoming")
  // Short labels for the 375px accordion header.
  const stepTitle = { 1: "Setting", 2: "Stone", 3: "Review" } as const

  return (
    <>
      {/* Desktop bar (Figma 7336:177134): title column, then three equal steps split by dividers,
          so the steps stretch with the viewport instead of sitting at fixed widths. */}
      <div className="hidden items-center gap-2 border-y border-border-subtle bg-primary-foreground px-margin py-3 lg:flex">
        <p className="w-card shrink-0 type-h5 text-primary">Design Your Ring</p>
        <ol className="flex min-w-0 flex-1 items-center gap-4">
          {[
            { n: 1 as const, label: "Setting", price: setting.price, detail: setting.name },
            { n: 2 as const, label: "Stone", price: stone.price, detail: stone.title },
            { n: 3 as const, label: "Finishing Touches", price: 0, detail: "" },
          ].map((step) => {
            const state = stateOf(step.n)
            return (
              <Fragment key={step.n}>
                {step.n > 1 && <li aria-hidden className="w-px self-stretch bg-muted" />}
                <li className="flex min-w-0 flex-1 items-center gap-3" aria-current={state === "current" ? "step" : undefined}>
                  <StepMarker n={step.n} state={state} shape="circle" />
                  {state === "done" && step.n < 3 ? (
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-3 type-label-xs text-primary">
                        <span className="flex gap-2">
                          <span>{step.label}:</span>
                          <span>{formatPrice(step.price)}</span>
                        </span>
                        <button type="button" className="cursor-pointer underline" onClick={() => notInTest("Viewing a previous step")}>
                          View
                        </button>
                        <button type="button" className="cursor-pointer underline" onClick={() => notInTest("Editing a previous step")}>
                          Edit
                        </button>
                      </div>
                      <p className="truncate type-caption font-medium text-primary">{step.detail}</p>
                    </div>
                  ) : (
                    // Current / upcoming step: title + description, no price.
                    <div className="flex min-w-0 flex-col gap-0.75">
                      <span className="truncate type-label-xs text-primary">{step.label}</span>
                      <span className="truncate type-caption text-muted-foreground">{STEP_DESCRIPTION[step.n]}</span>
                    </div>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </div>

      {/* Mobile accordion: opens over the page with a dimmed backdrop */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 animate-in fade-in lg:hidden"
        />
      )}
      <div
        className="sticky top-(--header-offset) z-30 border-b border-border-subtle bg-background transition-[top] duration-300 ease-out lg:hidden"
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 bg-secondary px-margin whitespace-nowrap"
        >
          <span className="type-label-xs text-primary">Design Your Own</span>
          <span className="flex min-w-0 items-center gap-2 type-label-xs text-primary">
            <span className="truncate">Step {current}. {mobileLabel ?? stepTitle[current]}</span>
            <CaretDownIcon className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
          </span>
        </button>
        {open && (
          <ol className="absolute inset-x-0 top-full border-b border-border-subtle bg-background px-margin shadow-lg animate-in fade-in slide-in-from-top-1">
            {[
              stateOf(1) === "done"
                ? { n: 1 as const, label: "Setting", lines: [setting.name, setting.metal], price: formatPrice(setting.price) }
                : { n: 1 as const, label: "Setting", lines: [STEP_DESCRIPTION[1]], price: "" },
              stateOf(2) === "done"
                ? { n: 2 as const, label: "Stone", lines: [stone.title], price: formatPrice(stone.price) }
                : { n: 2 as const, label: "Stone", lines: [STEP_DESCRIPTION[2]], price: "" },
              { n: 3 as const, label: "Finishing Touches", lines: ["Size, personalize & review"], price: `Total: ${formatPrice(total)}` },
            ].map((step, i, all) => (
              <li
                key={step.n}
                className={cn("flex gap-3 py-4", i < all.length - 1 && "border-b border-muted")}
                aria-current={step.n === current ? "step" : undefined}
              >
                <StepMarker n={step.n} state={stateOf(step.n)} shape="square" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-label-xs text-muted-foreground">{step.label}</span>
                  {step.lines.map((line) => (
                    <span key={line} className="text-xs-2 leading-4 text-primary">
                      {line}
                    </span>
                  ))}
                  {step.price && <span className="text-xs-2 leading-4 font-semibold text-primary">{step.price}</span>}
                </div>
                {step.n < current && (
                  <button
                    type="button"
                    onClick={() => notInTest("Editing a previous step")}
                    className="cursor-pointer self-start type-label-xs text-primary underline"
                  >
                    Edit
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
