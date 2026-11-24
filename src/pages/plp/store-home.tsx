import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { PLP_PATH } from "@/data/plp"
import { useFlow, useFlowPath } from "@/flow/flow-context"

/**
 * Storefront homepage: the entry point to the Engagement Ring PLP prototype.
 * Figma "Desktop - Homepage_Header" (7845:197899) and "Mobile - Homepage_Fixed Bottom Nav" (7845:197904).
 */
export function StoreHome() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const flowPath = useFlowPath()
  const flow = useFlow()

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader navigation mobileHidden />
      <main>
        <section className="relative isolate flex min-h-160 flex-col items-center justify-end overflow-hidden px-margin pt-40 pb-10 text-center lg:h-130 lg:min-h-0 lg:justify-center lg:pt-14 lg:pb-10">
          <img
            src="/images/nav/home-hero.jpg"
            alt=""
            className="absolute inset-0 -z-20 size-full object-cover object-[60%_40%]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/30" />

          {/* Mobile: the logo sits on the hero */}
          <div className="absolute inset-x-0 top-6 flex flex-col items-center gap-2 lg:hidden">
            {/* Prototype-only: in the flows the logo returns to the start; in the standalone tests it shows the not-in-test notice. */}
            {flow ? (
              <Link to={flowPath("/")} aria-label="Shane Co. (back to the prototype list)">
                <img src="/images/logo.svg" alt="" className="h-10 w-auto brightness-0 invert" />
              </Link>
            ) : (
              <button type="button" onClick={() => notInTest("The homepage")} aria-label="Shane Co." className="cursor-pointer">
                <img src="/images/logo.svg" alt="" className="h-10 w-auto brightness-0 invert" />
              </button>
            )}
            <img src="/images/tagline.svg" alt="Your friend & jeweler" className="h-2 w-auto brightness-0 invert" />
          </div>

          <div className="flex max-w-sm flex-col items-center gap-4 text-primary-foreground lg:mt-24">
            <h1 className="type-h2 font-medium">Create your Perfect Engagement Ring</h1>
            <p className="text-base leading-6">Crafted to the highest standards with honest, everyday pricing.</p>
          </div>
          <div className="mt-12 flex w-full max-w-66 flex-col gap-2">
            <Button
              variant="secondary"
              className="w-full bg-background text-primary hover:bg-secondary"
              onClick={() => {
                navigate(flowPath(PLP_PATH))
                window.scrollTo({ top: 0 })
              }}
            >
              I Know What I Want
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => notInTest("The Ring Finder Quiz")}
            >
              Help Me Choose
            </Button>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 bg-primary px-margin py-14 text-center text-primary-foreground">
          <p className="hidden font-heading text-sm leading-5 font-medium tracking-[1px] text-primary-foreground/50 uppercase lg:block">
            Your Friend &amp; Jeweler
          </p>
          <p className="max-w-160 type-h5 font-medium">
            Since 1929, our family has led with integrity, offering exceptional beauty, honest guidance, and true value
            for every customer.
          </p>
        </section>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  )
}
