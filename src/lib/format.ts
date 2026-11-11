const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** $6,515 */
export const formatPrice = (amount: number) => usd.format(amount)
