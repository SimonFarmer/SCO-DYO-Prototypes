import { BrowserRouter, Route, Routes } from "react-router"
import { NotInTestProvider } from "@/components/prototype/not-in-test"
import { NaturalDiamondPdp, NaturalDiamondsGlp } from "@/pages/diamonds"
import { FlowLayout } from "@/flow/flow-context"
import { FlowSettingPdp } from "@/flow/pages/flow-setting"
import { FlowAddedToBag, FlowRingReviewB, FlowStep3 } from "@/flow/finish/finish-pages"
import { FlowDiamondPdp } from "@/flow/stone/diamond-pages"
import { FlowDiamondsPlp } from "@/flow/stone/diamonds-plp"
import { FlowStonePreferences } from "@/flow/stone/preferences-page"
import { FlowStoneRecommendations } from "@/flow/stone/recommendations-page"
import { Blank, Home } from "@/pages/home"
import { EngagementRingPlp } from "@/pages/plp"
import { StoreHome } from "@/pages/plp/store-home"
import { Test1 } from "@/pages/test-1"
import { Test2 } from "@/pages/test-2"
import { Test2DiamondsPlp } from "@/pages/test-2/diamonds-plp"
import { Test2Recommendations } from "@/pages/test-2/recommendations"
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
            <Route path="/natural-diamonds" element={<NaturalDiamondsGlp />} />
            <Route path="/natural-diamonds/:id" element={<NaturalDiamondPdp />} />
            <Route path="/test-1/:variant?" element={<Test1 />} />
            <Route path="/test-2/:variant?" element={<Test2 />} />
            <Route path="/test-2/:variant/recommendations" element={<Test2Recommendations />} />
            <Route path="/test-2/:variant/diamonds" element={<Test2DiamondsPlp />} />
            <Route path="/test-3-quickview/:variant?" element={<Test3Quickview />} />
            <Route path="/test-3-quickview/:variant/diamond/:id" element={<Test3QuickviewPdp />} />
            <Route path="/test-3-quickview/:variant/review" element={<Test3Done />} />
            <Route path="/test-3-specs/:variant?" element={<Test3Specs />} />
            <Route path="/test-3-specs/:variant/review" element={<Test3Done />} />
            {/* Full DYO flow (Test 5, moderated): its own routes and build, so the tests above stay untouched. */}
            <Route path="/flow" element={<FlowLayout />}>
              <Route index element={<StoreHome />} />
              <Route path="shop" element={<StoreHome />} />
              <Route path="engagement-rings" element={<EngagementRingPlp />} />
              <Route path="engagement-rings/:slug" element={<EngagementRingPlp />} />
              <Route path="setting" element={<FlowSettingPdp />} />
              <Route path="stone" element={<FlowStonePreferences />} />
              <Route path="stone/recommendations" element={<FlowStoneRecommendations />} />
              <Route path="diamonds" element={<FlowDiamondsPlp />} />
              <Route path="diamond/:id" element={<FlowDiamondPdp />} />
              <Route path="finish" element={<FlowStep3 />} />
              <Route path="review" element={<FlowRingReviewB />} />
              <Route path="added" element={<FlowAddedToBag />} />
            </Route>
            <Route path="/test-4/:variant?" element={<Test4 />} />
            <Route path="/test-4/:variant/review" element={<RingReviewB />} />
            <Route path="/test-4/:variant/added" element={<AddedToBag />} />
            {/* Older ?variant= links (before per-variant paths) keep working. */}
            <Route path="/test-2/recommendations" element={<Test2Recommendations />} />
            <Route path="/test-2/diamonds" element={<Test2DiamondsPlp />} />
            <Route path="/test-4/review" element={<RingReviewB />} />
            <Route path="/test-4/added" element={<AddedToBag />} />
            <Route path="*" element={<Blank />} />
          </Routes>
        </RingBuildProvider>
      </NotInTestProvider>
    </BrowserRouter>
  )
}
