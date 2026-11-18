import type { ReactNode } from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Slider on Base UI, styled to the Pattern Library range slider (SCO Drop 2 price filter):
 * light track, charcoal range, round white thumbs with a charcoal border.
 * Optional `marks` draw 1px step ticks on the track (Figma “Point”), e.g. the diamond color/clarity grades.
 * `children` render inside the track, under the thumbs, so overlays (bands, ticks) share the thumbs' % positions.
 */
function Slider({
  className,
  marks,
  trackClassName,
  indicatorClassName,
  controlClassName,
  thumbClassName,
  thumbContent,
  children,
  ...props
}: Omit<SliderPrimitive.Root.Props<number[]>, "children"> & {
  marks?: number[]
  /** e.g. the 6px track of the DYO stone simulator */
  trackClassName?: string
  indicatorClassName?: string
  /** e.g. a wider inset so a pill thumb stays on the track at either end */
  controlClassName?: string
  thumbClassName?: string
  /** Content inside each thumb (e.g. a grip icon) */
  thumbContent?: ReactNode
  children?: ReactNode
}) {
  const min = props.min ?? 0
  const max = props.max ?? 100
  const count = Array.isArray(props.value ?? props.defaultValue) ? (props.value ?? props.defaultValue)!.length : 1
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn("w-full touch-none select-none", className)} {...props}>
      <SliderPrimitive.Control className={cn("flex h-6 w-full items-center px-2", controlClassName)}>
        <SliderPrimitive.Track className={cn("relative h-1 w-full rounded-full bg-muted", trackClassName)}>
          <SliderPrimitive.Indicator className={cn("rounded-full bg-primary", indicatorClassName)} />
          {marks?.map((m) => (
            <span
              key={m}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-border-subtle"
              style={{ left: `${((m - min) / (max - min)) * 100}%` }}
            />
          ))}
          {children}
          {Array.from({ length: count }, (_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              index={i}
              className={cn(
                "size-4 cursor-grab rounded-full border border-primary bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing",
                thumbClassName,
              )}
            >
              {thumbContent}
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
