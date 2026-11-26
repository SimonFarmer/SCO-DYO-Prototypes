import type { ReactNode } from "react"
import { MediaNote } from "@/components/pdp/media-note"

/**
 * Photo notes for a mobile carousel that has the "1 / 4" counter (GalleryCounter). The notes stay put
 * bottom-left instead of sliding with the photos, each fading with the swipe: out by the halfway point,
 * the next one in from there. They stop short of the counter on the right. A note that is mostly
 * faded stops taking taps (notes can hold links, e.g. "Upgrade").
 * Place it inside the carousel's positioned wrapper.
 */
export function GalleryNotes({
  notes,
  pos,
  index,
}: {
  /** One entry per slide; undefined for slides without a note */
  notes: (ReactNode | undefined)[]
  /** Scroll position in slides, fractional mid-swipe */
  pos: number
  /** Current slide */
  index: number
}) {
  return notes.map((note, i) => {
    const opacity = Math.max(0, 1 - Math.abs(pos - i) * 2)
    if (!note || opacity === 0) return null
    // The wrapper only carries the fade; the note still places itself against the slide.
    return (
      <div key={i} style={{ opacity }} className={opacity < 0.5 ? "pointer-events-none" : undefined} aria-hidden={i !== index}>
        <MediaNote className="bottom-2 left-2 max-w-[calc(100%-5rem)]">{note}</MediaNote>
      </div>
    )
  })
}
