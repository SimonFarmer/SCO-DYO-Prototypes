import { Fragment } from "react"
import { cn } from "@/lib/utils"

export interface DyoStep {
  title: string
  description: string
}

export const DYO_STEPS: DyoStep[] = [
  { title: "Setting", description: "Select your setting" },
  { title: "Stone", description: "Find your perfect stone" },
  { title: "Finishing Touches", description: "Size, personalize & review" },
]

interface DyoStepperProps {
  /** 1-based index of the active step */
  current: number
  steps?: DyoStep[]
  /** Optional per-step summary (e.g. chosen setting) shown instead of the description */
  summaries?: Partial<Record<number, string>>
}

/**
 * "Design Your Ring" horizontal 1/2/3 stepper bar (shared across all DYO prototypes).
 * View/Edit links are intentionally absent: they are out of scope for the unmoderated tests.
 */
export function DyoStepper({ current, steps = DYO_STEPS, summaries }: DyoStepperProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border-subtle bg-primary-foreground px-margin py-3">
      <p className="hidden w-card font-heading text-xl font-medium tracking-[-0.6px] text-secondary-foreground lg:block">
        Design Your Ring
      </p>
      <ol className="flex flex-1 items-start gap-4">
        {steps.map((step, i) => {
          const n = i + 1
          const active = n === current
          return (
            <Fragment key={step.title}>
              {i > 0 && <li aria-hidden className="w-px self-stretch bg-muted" />}
              <li className="flex flex-1 items-center gap-3" aria-current={active ? "step" : undefined}>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-2xl leading-9 font-medium tracking-[-0.6px] [font-variant-numeric:lining-nums_proportional-nums]",
                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                  )}
                >
                  {n}
                </span>
                <span className="hidden min-w-0 flex-col gap-1 md:flex">
                  <span className="type-label-xs font-semibold text-primary">{step.title}</span>
                  <span className="truncate text-xs leading-none text-muted-foreground">
                    {summaries?.[n] ?? step.description}
                  </span>
                </span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}
