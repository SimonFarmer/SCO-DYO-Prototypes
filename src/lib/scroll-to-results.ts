/** Results anchor shared by the listing pages (PLP and diamond GLP). */
export const RESULTS_ID = "plp-results"

/**
 * Glide down to the results after a hero choice, so it's clear the listing below was refined.
 * The site header hides on the way down, so the target leaves room only for the sticky mobile stepper bar.
 */
export function scrollToResults() {
  const results = document.getElementById(RESULTS_ID)
  if (!results) return
  const bar = document.querySelector<HTMLElement>('[data-slot="stepper-bar"]')
  const top = results.getBoundingClientRect().top + window.scrollY - (bar?.offsetHeight ?? 0)
  window.scrollTo({ top, behavior: "smooth" })
}

/** Base UI releases a drawer's scroll lock a tick after closing and restores the old scroll position, so wait it out. */
export function scrollAfterUnlock(frames = 30) {
  if (document.documentElement.hasAttribute("data-base-ui-scroll-locked") && frames > 0) {
    window.setTimeout(() => scrollAfterUnlock(frames - 1), 16)
  } else {
    scrollToResults()
  }
}
