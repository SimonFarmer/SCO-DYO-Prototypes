import { BrowserRouter, Route, Routes } from "react-router"
import { NotInTestProvider } from "@/components/prototype/not-in-test"
import { Home } from "@/pages/home"
import { EngagementRingPlp } from "@/pages/plp"
import { StoreHome } from "@/pages/plp/store-home"
import { Test1 } from "@/pages/test-1"
import { Test2 } from "@/pages/test-2"
import { Test2DiamondsPlp } from "@/pages/test-2/diamonds-plp"
import { Test2Recommendations } from "@/pages/test-2/recommendations"
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
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<StoreHome />} />
            <Route path="/engagement-rings" element={<EngagementRingPlp />} />
            <Route path="/engagement-rings/:slug" element={<EngagementRingPlp />} />
            <Route path="/test-1" element={<Test1 />} />
            <Route path="/test-2" element={<Test2 />} />
            <Route path="/test-2/recommendations" element={<Test2Recommendations />} />
            <Route path="/test-2/diamonds" element={<Test2DiamondsPlp />} />
            <Route path="/test-4" element={<Test4 />} />
            <Route path="/test-4/review" element={<RingReviewB />} />
            <Route path="/test-4/added" element={<AddedToBag />} />
          </Routes>
        </RingBuildProvider>
      </NotInTestProvider>
    </BrowserRouter>
  )
}
