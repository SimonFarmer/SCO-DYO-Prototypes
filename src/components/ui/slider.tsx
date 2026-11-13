import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

type SliderProps = SliderPrimitive.Root.Props<number | readonly number[]> & {
  /** Values to mark with a 1px step tick on the track (Figma “Point”, input colour). */
  marks?: number[]
}

/**
 * Pattern Library range slider: 6px secondary track, primary range, 16px white thumbs
 * with a primary border and shadow-md. Optional step ticks via `marks`.
 */
function Slider({ className, value, defaultValue, marks, min = 0, max = 100, ...props }: SliderProps) {
  const initial = value ?? defaultValue
  const thumbs = Array.isArray(initial) ? initial.length : 1
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn("w-full touch-none select-none", className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-4 w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-secondary">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
          {marks?.map((m) => (
            <span
              key={m}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-border-subtle"
              style={{ left: `${((m - min) / (max - min)) * 100}%` }}
            />
          ))}
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
