import type { ReactNode } from "react"

/**
 * DYO step layout: gallery column (7/12) + buy-form column (5/12) on desktop,
 * stacked on mobile. Mirrors the Figma "Product Overviews" frame.
 */
export function PageColumns({ gallery, children }: { gallery: ReactNode; children: ReactNode }) {
  return (
    <main className="lg:flex lg:items-start">
      <div className="bg-secondary lg:w-7/12">{gallery}</div>
      <div className="bg-primary-foreground px-margin py-8 lg:w-5/12 lg:pt-5 lg:pr-16 lg:pb-16 lg:pl-14">
        <div className="mx-auto flex max-w-xl flex-col gap-6 lg:mx-0 lg:max-w-none lg:gap-8 lg:pt-5">{children}</div>
      </div>
    </main>
  )
}
