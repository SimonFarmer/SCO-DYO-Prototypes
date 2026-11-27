import { useRef, type ReactNode } from "react"
import { PdpStickyBar } from "@/components/pdp/pdp-sticky-bar"

/**
 * Full flows, mobile: the PDPs' sticky preview bar (Figma SCO Drop 3a – PDP, “Mobile scrolled past gallery”,
 * 3919:146872) on the other pages that open with a gallery. Wraps the gallery and slides the bar in once it has
 * scrolled away; “View Gallery” brings it back. Desktop is unchanged (no bar).
 */
export function MobileGalleryBar({
  image,
  imageAlt,
  title,
  specs,
  children,
}: {
  image: string
  imageAlt: string
  title: string
  specs: string[]
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <>
      <PdpStickyBar image={image} imageAlt={imageAlt} title={title} specs={specs} mobileAfter={ref} />
      <div ref={ref}>{children}</div>
    </>
  )
}
