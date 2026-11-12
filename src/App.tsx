import { BrowserRouter, Route, Routes } from "react-router"
import { NotInTestProvider } from "@/components/prototype/not-in-test"
import { Home } from "@/pages/home"
import { Test1 } from "@/pages/test-1"
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
            <Route path="/test-1" element={<Test1 />} />
            <Route path="/test-4" element={<Test4 />} />
            <Route path="/test-4/review" element={<RingReviewB />} />
            <Route path="/test-4/added" element={<AddedToBag />} />
          </Routes>
        </RingBuildProvider>
      </NotInTestProvider>
    </BrowserRouter>
  )
}
