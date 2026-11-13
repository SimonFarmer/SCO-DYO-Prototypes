import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

/**
 * Pattern Library range slider: 6px secondary track, primary range, 16px white thumbs
 * with a primary border and shadow-md.
 */
function Slider({ className, value, defaultValue, ...props }: SliderPrimitive.Root.Props<number | readonly number[]>) {
  const initial = value ?? defaultValue
  const thumbs = Array.isArray(initial) ? initial.length : 1
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      className={cn("w-full touch-none select-none", className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-4 w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-secondary">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
          {Array.from({ length: thumbs }, (_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              index={i}
              className="size-4 rounded-full border border-primary bg-background shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
