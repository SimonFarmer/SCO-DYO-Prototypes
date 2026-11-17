import { BrowserRouter, Route, Routes } from "react-router"
import { NotInTestProvider } from "@/components/prototype/not-in-test"
import { Blank, Home } from "@/pages/home"
import { EngagementRingPlp } from "@/pages/plp"
import { StoreHome } from "@/pages/plp/store-home"
import { Test1 } from "@/pages/test-1"
import { Test3Done, Test3Quickview, Test3QuickviewPdp, Test3Specs } from "@/pages/test-3"
import { Test4 } from "@/pages/test-4"
import { AddedToBag } from "@/pages/test-4/added-to-bag"
import { RingReviewB } from "@/pages/test-4/ring-review-b"
import { RingBuildProvider } from "@/state/ring-build"

export default function App() {
  return (
    <BrowserRouter>
      <NotInTestProvider>
        <RingBuildProvider>
          <Routes>
            {/* The root is the prototype list (the header logo returns here).
                Participants get one standalone URL per variant (/test-1/a …); unknown URLs are blank. */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<StoreHome />} />
            <Route path="/engagement-rings" element={<EngagementRingPlp />} />
            <Route path="/engagement-rings/:slug" element={<EngagementRingPlp />} />
            <Route path="/test-1/:variant?" element={<Test1 />} />
            <Route path="/test-3-quickview/:variant?" element={<Test3Quickview />} />
            <Route path="/test-3-quickview/:variant/diamond/:id" element={<Test3QuickviewPdp />} />
            <Route path="/test-3-quickview/:variant/review" element={<Test3Done />} />
            <Route path="/test-3-specs/:variant?" element={<Test3Specs />} />
            <Route path="/test-3-specs/:variant/review" element={<Test3Done />} />
            <Route path="/test-4/:variant?" element={<Test4 />} />
            <Route path="/test-4/:variant/review" element={<RingReviewB />} />
            <Route path="/test-4/:variant/added" element={<AddedToBag />} />
            {/* Older ?variant= links (before per-variant paths) keep working. */}
            <Route path="/test-4/review" element={<RingReviewB />} />
            <Route path="/test-4/added" element={<AddedToBag />} />
            <Route path="*" element={<Blank />} />
          </Routes>
        </RingBuildProvider>
      </NotInTestProvider>
    </BrowserRouter>
  )
}
