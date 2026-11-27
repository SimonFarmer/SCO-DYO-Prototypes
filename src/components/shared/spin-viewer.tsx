import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/** Pixels of drag per frame (256 frames: a full turn in about 510px). */
const DRAG_PX = 2
/** Playing: 20 frames a second, a full turn in about 13s (the Vision360 viewer's own pace). */
const FRAME_MS = 50

/**
 * A "3D" stone: a turntable of frames (a Vision360 capture). It rests on `start` (the front view) with a play
 * button over it, as the stone step gallery's 360° tile. Play turns it on its own; with a mouse, dragging turns it
 * by hand and pauses it, bringing the play button back. Touch leaves the drag to the page, so a mobile gallery still
 * swipes past it (the play button works there too).
 *
 * Every frame is decoded up front and drawn onto a canvas, once per animation frame, outside React: swapping an
 * <img> src on each pointer move made the browser decode a JPEG per step and the turn stuttered.
 */
export function SpinViewer({ frames, start = 0, alt, className }: { frames: string[]; start?: number; alt: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const images = useRef<HTMLImageElement[]>([])
  const frame = useRef(start)
  const raf = useRef(0)
  const drag = useRef<{ x: number; frame: number } | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)

  const draw = () => {
    raf.current = 0
    const c = canvas.current
    const img = images.current[frame.current]
    if (!c || !img) return
    if (c.width !== img.naturalWidth) c.width = img.naturalWidth
    if (c.height !== img.naturalHeight) c.height = img.naturalHeight
    c.getContext("2d")?.drawImage(img, 0, 0)
  }
  const show = (n: number) => {
    frame.current = n
    if (!raf.current) raf.current = requestAnimationFrame(draw)
  }

  // Load and decode every frame, so dragging only ever draws a ready bitmap.
  useEffect(() => {
    let alive = true
    const imgs = frames.map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
    images.current = imgs
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (!alive) return
      setReady(true)
      show(frame.current)
    })
    return () => {
      alive = false
      cancelAnimationFrame(raf.current)
      raf.current = 0
    }
  }, [frames])

  // Playing: advance by elapsed time (a frame every FRAME_MS), so the pace holds on any refresh rate. A play
  // pressed while the frames still load starts once they're ready.
  useEffect(() => {
    if (!playing || !ready) return
    let id = 0
    let last = performance.now()
    let carry = 0
    const tick = (now: number) => {
      carry += now - last
      last = now
      const steps = Math.floor(carry / FRAME_MS)
      if (steps) {
        carry -= steps * FRAME_MS
        show((frame.current + steps) % frames.length)
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [playing, ready, frames.length])

  return (
    <div
      className={cn("relative size-full select-none", ready && "cursor-grab active:cursor-grabbing", className)}
      onPointerDown={(e) => {
        if (!ready || e.pointerType !== "mouse") return
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { x: e.clientX, frame: frame.current }
        setPlaying(false)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const n = frames.length
        const step = Math.round((drag.current.x - e.clientX) / DRAG_PX)
        show((((drag.current.frame + step) % n) + n) % n)
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {/* The resting frame until every frame is decoded; then the canvas takes over. */}
      <img src={frames[start]} alt={alt} draggable={false} className={cn("size-full object-cover", ready && "invisible")} />
      <canvas ref={canvas} role="img" aria-label={alt} className={cn("absolute inset-0 size-full object-cover", !ready && "invisible")} />
      {/* Play (the stone step gallery's 360° video button: a white disc with the play icon). */}
      {!playing && (
        <button
          type="button"
          aria-label="Play 360° view"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setPlaying(true)}
          className="absolute top-1/2 left-1/2 flex size-14 -translate-1/2 cursor-pointer items-center justify-center rounded-full bg-white"
        >
          <img src="/images/icons/play.svg" alt="" className="size-6" />
        </button>
      )}
    </div>
  )
}
