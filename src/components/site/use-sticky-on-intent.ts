import { useEffect, useState, type RefObject } from "react"

/**
 * Sticky-on-intent: the element hides while the user scrolls down and comes back as soon as they
 * scroll up. Publishes its visible height as `--header-offset` on <html> so other sticky elements
 * (e.g. the PDP buy form) can sit just below it: `top-(--header-offset)`.
 */
export function useStickyOnIntent(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    let lastY = window.scrollY
    let shown = true
    let frame = 0

    // A click can change the page height above the viewport (e.g. a metal with fewer gallery images);
    // the browser then shifts scrollY to keep the content in place. That isn't the user scrolling,
    // so scroll changes right after a click don't show or hide the header.
    let ignoreUntil = 0
    const onClick = () => {
      ignoreUntil = performance.now() + 400
    }

    const publish = () => root.style.setProperty("--header-offset", shown ? `${el.offsetHeight}px` : "0px")
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY
        if (performance.now() < ignoreUntil) {
          lastY = y
          return
        }
        if (Math.abs(delta) < 4) return // ignore jitter
        const next = y <= el.offsetHeight || delta < 0
        if (next !== shown) {
          shown = next
          setVisible(next)
          publish()
        }
        lastY = y
      })
    }

    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("click", onClick, { capture: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("click", onClick, { capture: true })
      root.style.removeProperty("--header-offset")
    }
  }, [ref])

  return visible
}
