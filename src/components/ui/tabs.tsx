import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

/**
 * Pattern Library "Tabs": default is the underline style (.Tab Item — 42px, Label XS,
 * active tab has a primary bottom border). `pill` keeps shadcn's segmented look.
 */
const tabsListVariants = cva("group/tabs-list flex w-full items-start", {
  variants: {
    variant: {
      default: "border-b border-border-subtle",
      pill: "w-fit items-center bg-muted p-0.5",
    },
  },
  defaultVariants: { variant: "default" },
})

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex min-w-14 items-center justify-center gap-2 px-4 py-1 type-label-xs font-semibold whitespace-nowrap text-primary transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:-mb-px group-data-[variant=default]/tabs-list:h-10 group-data-[variant=default]/tabs-list:border-b group-data-[variant=default]/tabs-list:border-transparent group-data-[variant=default]/tabs-list:data-active:border-primary group-data-[variant=default]/tabs-list:data-active:bg-bg-input-30",
        "group-data-[variant=pill]/tabs-list:h-8 group-data-[variant=pill]/tabs-list:data-active:bg-background",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
