const COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: "Customer Service",
    links: ["(866) 467-4263", "Speak to a consultant", "Email Us", "Find Store", "Book Appointment", "FAQs"],
  },
  {
    heading: "About Us",
    links: ["Shane Co. Cares", "In the news", "Shane Co. Blog", "Careers", "Reviews", "Corporate responsibility"],
  },
  {
    heading: "Why Shane Co.?",
    links: [
      "All Inclusive Free Lifetime Warranty℠",
      "Easy Trade-Up Program℠",
      "Service & Maintenance",
      "Shipping & Returns",
    ],
  },
  {
    heading: "Shopping with Shane Co.",
    links: [
      "Shane Co. Credit Card",
      "Gift Cards",
      "Order, Layaway & Shop Job Lookup",
      "Split payments",
      "Track your order",
    ],
  },
]

const SOCIAL = [
  { label: "Instagram", icon: "/assets/footer/social-instagram.svg" },
  { label: "TikTok", icon: "/assets/footer/social-tiktok.svg" },
  { label: "Facebook", icon: "/assets/footer/social-facebook.svg" },
  { label: "YouTube", icon: "/assets/footer/social-youtube.svg" },
  { label: "Pinterest", icon: "/assets/footer/social-pinterest.svg" },
  { label: "LinkedIn", icon: "/assets/footer/social-linkedin.svg" },
]

const LEGAL = ["Privacy Policy", "Terms & Conditions", "Site Map", "Accessibility", "Do Not Share My Personal Information"]

const inert = (e: React.MouseEvent) => e.preventDefault()

/** Global site footer (Pattern Library "Footer", desktop 1440). */
export function SiteFooter() {
  return (
    <footer className="bg-secondary">
      <div className="flex flex-col px-margin py-10">
        <div className="flex w-full flex-col gap-10">
          <img src="/assets/footer/logo.svg" alt="Shane Co." className="h-11 w-fit" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col, i) => (
              <div key={col.heading} className="flex flex-col gap-6">
                <h2 className="font-sans type-label-m font-semibold text-foreground">{col.heading}</h2>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" onClick={inert} className="text-sm text-card-foreground hover:underline">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
                {i === 0 && (
                  <ul className="flex" aria-label="Social media">
                    {SOCIAL.map((s) => (
                      <li key={s.label}>
                        <a
                          href="#"
                          onClick={inert}
                          aria-label={s.label}
                          className="flex h-9 items-center px-2 py-2.5 hover:bg-accent"
                        >
                          <span className="flex size-4 items-center justify-center">
                            <img src={s.icon} alt="" className="max-h-4 max-w-4" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-accent px-margin py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <img src="/assets/footer/tagline-your-friend-and-jeweler.svg" alt="Your friend & jeweler" className="h-4 w-fit" />
          <div className="flex flex-col gap-4 lg:items-end">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs leading-none text-primary">
              {LEGAL.map((l) => (
                <li key={l}>
                  <a href="#" onClick={inert} className="hover:underline">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-none text-secondary-foreground lg:text-right">
              Copyright © 2000-2026 Shane Co. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
