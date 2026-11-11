import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Pattern Library "Button" — square corners, Label XS (11px / 1px tracking / uppercase / semibold).
 * Outline border uses border-subtle (#D5D5D2), the token Figma binds as shadcn `--input`.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent bg-clip-padding type-label-xs font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border-subtle bg-background text-primary hover:bg-secondary aria-expanded:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "text-primary hover:bg-secondary aria-expanded:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        /** Underlined text button ("Price explained", "View product details") */
        link: "border-0 px-0 text-primary underline decoration-from-font underline-offset-auto hover:text-secondary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-14 py-2",
        wide: "h-10 px-6 py-2",
        inline: "h-auto p-0 gap-0.5",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
