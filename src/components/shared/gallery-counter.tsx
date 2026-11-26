import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** Bottom-right corner brightness per image, so each photo is measured once. */
const cornerCache = new Map<string, boolean>()

/**
 * Whether the bottom-right corner of an image is dark (where the "1 / 4" counter sits), so the counter
 * can switch to the light colour there. Reads a downscaled copy of the image. Images from other hosts
 * (Shane Co.'s ring renders, the full flows' first slide) aren't read: they can't be without CORS, and
 * they are always on a light background, so they keep the dark counter.
 */
const isSameOrigin = (src: string) => new URL(src, window.location.href).origin === window.location.origin

function useDarkCorner(src: string | undefined) {
  // Re-render once a newly measured image lands in the cache.
  const [, setMeasured] = useState(0)
  useEffect(() => {
    if (!src || cornerCache.has(src) || !isSameOrigin(src)) return
    let live = true
    const img = new Image()
    const settle = (isDark: boolean) => {
      cornerCache.set(src, isDark)
      if (live) setMeasured((n) => n + 1)
    }
    img.onerror = () => settle(false)
    img.onload = () => {
      const size = 48
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = size
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, size, size)
      // The counter takes roughly the right 20% × bottom 10% of a slide.
      let data: Uint8ClampedArray
      try {
        data = ctx.getImageData(Math.round(size * 0.8), Math.round(size * 0.9), Math.round(size * 0.2), Math.round(size * 0.1)).data
      } catch {
        return settle(false) // unreadable: keep the default dark counter
      }
      let sum = 0
      for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      settle(sum / (data.length / 4) < 140)
    }
    img.src = src
    return () => {
      live = false
    }
  }, [src])
  return src ? (cornerCache.get(src) ?? false) : false
}

/**
 * Mobile carousel position, "1 / 4" (Figma SCO Drop 3b – Customizer 8242:61615): Label/XS semibold,
 * bottom-right with its text 8px from the edge, in a 20px box 8px up so it lines up with the photo
 * notes and pickers bottom-left. Dark on light photos (as in Figma), light on dark ones.
 * Place it inside the carousel's positioned wrapper.
 */
export function GalleryCounter({
  index,
  total,
  src,
  className,
}: {
  index: number
  total: number
  /** Photo under the counter, measured for contrast. Omit when the corner is the plain background. */
  src?: string
  className?: string
}) {
  const darkCorner = useDarkCorner(src)
  return (
    <p
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute right-0 bottom-2 flex h-5 items-center gap-0.5 px-2 type-label-xs whitespace-nowrap [font-variant-numeric:tabular-nums] transition-colors duration-300",
        darkCorner ? "text-primary-foreground" : "text-primary",
        className,
      )}
    >
      <span>{Math.min(index, total - 1) + 1}</span>
      <span aria-hidden>/</span>
      <span className="sr-only">of</span>
      <span>{total}</span>
    </p>
  )
}
