import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

/**
 * shadcn/ui Slider on Base UI, styled to the Pattern Library range slider (SCO Drop 2 price filter):
 * light track, charcoal range, round white thumbs with a charcoal border.
 */
function Slider({
  className,
  trackClassName,
  indicatorClassName,
  ...props
}: SliderPrimitive.Root.Props<number[]> & {
  /** e.g. the 6px track of the DYO stone simulator */
  trackClassName?: string
  indicatorClassName?: string
}) {
  const count = Array.isArray(props.value ?? props.defaultValue) ? (props.value ?? props.defaultValue)!.length : 1
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn("w-full touch-none select-none", className)} {...props}>
      <SliderPrimitive.Control className="flex h-6 w-full items-center px-2">
        <SliderPrimitive.Track className={cn("relative h-1 w-full rounded-full bg-muted", trackClassName)}>
          <SliderPrimitive.Indicator className={cn("rounded-full bg-primary", indicatorClassName)} />
          {Array.from({ length: count }, (_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              index={i}
              className="size-4 cursor-grab rounded-full border border-primary bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
