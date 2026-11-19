import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Slider on Base UI, styled to the Pattern Library range slider (SCO Drop 2 price filter):
 * light track, charcoal range, round white thumbs with a charcoal border.
 * Optional `marks` draw 1px step ticks on the track (Figma “Point”), e.g. the diamond color/clarity grades.
 * Optional `getAriaValueText` (passed to each thumb) announces a readable value when positions are not the value
 * itself, e.g. the eased price slider.
 */
function Slider({
  className,
  marks,
  getAriaValueText,
  ...props
}: SliderPrimitive.Root.Props<number[]> & { marks?: number[]; getAriaValueText?: SliderPrimitive.Thumb.Props["getAriaValueText"] }) {
  const min = props.min ?? 0
  const max = props.max ?? 100
  const count = Array.isArray(props.value ?? props.defaultValue) ? (props.value ?? props.defaultValue)!.length : 1
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn("w-full touch-none select-none", className)} {...props}>
      <SliderPrimitive.Control className="flex h-6 w-full items-center px-2">
        <SliderPrimitive.Track className="relative h-1 w-full rounded-full bg-muted">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
          {marks?.map((m) => (
            <span
              key={m}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-border-subtle"
              style={{ left: `${((m - min) / (max - min)) * 100}%` }}
            />
          ))}
          {Array.from({ length: count }, (_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              index={i}
              getAriaValueText={getAriaValueText}
              className="size-4 cursor-grab rounded-full border border-primary bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
