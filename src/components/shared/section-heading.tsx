import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: React.ReactNode
  eyebrow?: string
  className?: string
}

/** Eyebrow (Label XS) + H3 title used by the PDP content blocks. */
export function SectionHeading({ title, eyebrow, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-1 text-primary", className)}>
      {eyebrow && <p className="type-label-xs font-semibold">{eyebrow}</p>}
      <h2 className="type-h3 font-medium">{title}</h2>
    </div>
  )
}
