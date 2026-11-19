import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Photo note on gallery images ("Shown in rose gold, round cut"). Notes name metal + stone, so they
 * wrap on narrow tiles instead of being cut off. Position it with `className` (it is absolute).
 */
export function MediaNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Badge className={cn("absolute h-auto justify-start py-0.75 text-left whitespace-normal", className)}>{children}</Badge>
  )
}
