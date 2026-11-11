import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge that knows the SCO Pattern Library token names, so e.g.
 * `text-xxs` (font size) and `text-primary` (colour) don't cancel each other out.
 */
const twMerge = extendTailwindMerge<"border-w" | "typography">({
  extend: {
    theme: {
      text: ["xxs", "xs-2"],
      spacing: [
        "margin",
        "margin-inset",
        "margin-listing",
        "content-margin",
        "section-y",
        "card-gap",
        "card",
        "product-card",
        "product-card-margin",
        "guided-intent",
        "assurances",
        "recommender",
        "category-wayfinder",
        "category-wayfinder-hero",
      ],
    },
    classGroups: {
      "border-w": [{ "border-w": ["0", "50", "100", "200", "300"] }],
      typography: [
        { type: ["h1", "h2", "h3", "h4", "h5", "label-xs", "label-s", "label-m", "caption"] },
      ],
    },
    // A `type-*` text style sets size, line height, tracking and family, so it overrides
    // those utilities when it comes later (e.g. a component's default `text-base`).
    conflictingClassGroups: {
      typography: ["font-size", "leading", "tracking", "font-family"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
