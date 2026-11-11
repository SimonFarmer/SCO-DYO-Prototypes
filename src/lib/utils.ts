import { createCn } from "cn/config"

/**
 * Class merger that knows the Pattern Library's non-default theme keys, so
 * e.g. `cn("text-xxs", "text-foreground")` keeps both (size vs colour) and
 * `cn("px-4", "px-margin")` resolves to the layout token.
 * Keep in sync with src/styles/theme.css when tokens are added.
 */
export const cn = createCn({
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
  },
})
