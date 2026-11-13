import { BrowserRouter, Route, Routes } from "react-router"
import { NotInTestProvider } from "@/components/prototype/not-in-test"
import { Blank, Home, TEAM_INDEX_PATH } from "@/pages/home"
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
            {/* Participants get one standalone URL per variant (/test-1/a …); nothing links between them.
                The root is blank; the team index of all prototypes lives at TEAM_INDEX_PATH. */}
            <Route path="/" element={<Blank />} />
            <Route path={TEAM_INDEX_PATH} element={<Home />} />
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
