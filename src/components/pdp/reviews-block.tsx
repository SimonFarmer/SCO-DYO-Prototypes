import { useMemo, useState } from "react"
import { CaretLeft, CaretRight, CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  SETTING_QUESTIONS,
  SETTING_REVIEWS,
  formatReviewDate,
  type Answer,
  type Question,
  type Review,
} from "@/data/reviews"
import { cn } from "@/lib/utils"
import { useNotInTest } from "@/components/prototype/not-in-test"

/*
 * Pattern Library "Reviews Block" — Viewport=1440px, Variant=Default (Figma ceWHNjl5yoEXdjK2b3Oo5J, 39665:17722).
 * All counts and percentages are derived from the mock data in src/data/reviews.ts.
 */

const PAGE_SIZE = 3

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <img
          key={i}
          src={i < Math.round(rating) ? "/images/reviews/star-filled.svg" : "/images/reviews/star-outline.svg"}
          alt=""
          className="size-6"
        />
      ))}
    </div>
  )
}

/* ───────────────────────── Summary ───────────────────────── */

function CustomerPhotos({ photos }: { photos: string[] }) {
  const [start, setStart] = useState(0)
  const visible = Array.from({ length: Math.min(4, photos.length) }, (_, i) => photos[(start + i) % photos.length])
  const step = (d: number) => setStart((s) => (s + d + photos.length) % photos.length)
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <p className="type-label-xs font-semibold text-primary">{photos.length} Customer Photos</p>
      <div className="relative flex w-full gap-1.5 border border-border-subtle p-2">
        {visible.map((src, i) => (
          <img key={`${src}-${i}`} src={src} alt="Customer photo" className="aspect-square min-w-0 flex-1 object-cover" />
        ))}
        {photos.length > 4 && (
          <>
            <button
              type="button"
              aria-label="Previous photos"
              onClick={() => step(-1)}
              className="absolute top-1/2 -left-px flex size-8 -translate-y-1/2 items-center justify-center bg-primary text-primary-foreground"
            >
              <CaretLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next photos"
              onClick={() => step(1)}
              className="absolute top-1/2 -right-px flex size-8 -translate-y-1/2 items-center justify-center bg-primary text-primary-foreground"
            >
              <CaretRight className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function ReviewSummary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    return { star, pct: Math.round((count / total) * 100) }
  })
  const photos = reviews.flatMap((r) => r.photos ?? [])

  const notInTest = useNotInTest()
  return (
    <div className="flex flex-col gap-4">
      <p className="border-b border-border-subtle pb-4 type-label-xs font-semibold text-primary">{total} Ratings</p>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end">
        <div className="flex w-full flex-col gap-6 lg:w-48">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-4 leading-none">
              <span className="font-heading text-7xl font-semibold tracking-[-1.8px] text-accent-foreground [font-variant-numeric:lining-nums_proportional-nums]">
                {average.toFixed(1)}
              </span>
              <span className="text-sm font-medium whitespace-nowrap text-foreground">out of 5 stars</span>
            </div>
            <Stars rating={average} className="h-4" />
          </div>
          <Button className="px-6 w-full" onClick={() => notInTest("Writing a review")}>
            Write a review
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-4">
          <p className="type-label-xs font-semibold text-primary">{total} Ratings</p>
          <ul className="flex w-full flex-col gap-1">
            {distribution.map(({ star, pct }) => (
              <li key={star} className="flex items-center gap-2 type-caption text-primary">
                <span className="w-3 text-center">{star}</span>
                {/* Figma bar height 18px; closest token h-4 (16px). */}
                <span className="h-4 flex-1 overflow-clip bg-secondary">
                  <span className="block h-full bg-primary" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-8">{pct}%</span>
              </li>
            ))}
          </ul>
        </div>
        {photos.length > 0 && <CustomerPhotos photos={photos} />}
      </div>
    </div>
  )
}

/* ───────────────────────── Listing ───────────────────────── */

type SortKey = "recent" | "highest" | "lowest"
const SORT_ITEMS = [
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest Rating" },
  { value: "lowest", label: "Lowest Rating" },
]
const FILTER_ITEMS = [
  { value: "all", label: "Star Ratings" },
  ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` })),
]

function ReviewRow({ review }: { review: Review }) {
  const attributes = [
    ["Age", review.age],
    ["Gender", review.gender],
    ["Location", review.location],
  ].filter(([, v]) => v) as [string, string][]
  return (
    <article className="flex flex-col gap-4 bg-primary-foreground">
      <div className="flex flex-col gap-2">
        <Stars rating={review.rating} />
        <h4 className="font-sans text-sm font-semibold text-primary">{review.title}</h4>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <div className="flex flex-1 flex-col gap-4">
          <p className="type-caption text-primary">{review.body}</p>
          <div className="flex items-start gap-3.5">
            <span className="text-xs font-semibold text-primary">{review.author}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle className="size-4" />
                <span className="type-label-xs font-semibold">Verified purchase</span>
              </span>
            )}
          </div>
          {attributes.length > 0 && (
            <dl className="flex flex-wrap gap-3.5 text-muted-foreground">
              {attributes.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="text-xxs leading-3 font-medium">{label}:</dt>
                  <dd className="text-xxs leading-3 font-semibold tracking-[0.5px]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xxs leading-3 font-medium text-muted-foreground">
            Purchased on {formatReviewDate(review.purchasedOn)}
          </p>
          {review.photos && (
            <div className="flex gap-0.5">
              {review.photos.map((src) => (
                <img key={src} src={src} alt="Photo from this review" className="size-14 object-cover" />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function ReviewListing({ reviews }: { reviews: Review[] }) {
  const [sort, setSort] = useState<SortKey>("recent")
  const [query, setQuery] = useState("")
  const [stars, setStars] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = reviews.filter(
      (r) =>
        (stars === "all" || r.rating === Number(stars)) &&
        (!q || `${r.title} ${r.body} ${r.author}`.toLowerCase().includes(q)),
    )
    return [...list].sort((a, b) =>
      sort === "highest"
        ? b.rating - a.rating || b.date.localeCompare(a.date)
        : sort === "lowest"
          ? a.rating - b.rating || b.date.localeCompare(a.date)
          : b.date.localeCompare(a.date),
    )
  }, [reviews, sort, query, stars])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-4">
        <p className="type-label-xs font-semibold text-primary" aria-live="polite">
          {shown.length} of {filtered.length} Reviews
        </p>
        <div className="grid max-w-2xl grid-cols-1 gap-2 md:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Sort</span>
            <Select items={SORT_ITEMS} value={sort} onValueChange={(v) => reset(setSort)(v as SortKey)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_ITEMS.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Search</span>
            <Input
              type="search"
              placeholder="Search reviews..."
              value={query}
              onChange={(e) => reset(setQuery)(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Filter</span>
            <Select items={FILTER_ITEMS} value={stars} onValueChange={(v) => reset(setStars)(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_ITEMS.map((i) => (
                  <SelectItem key={i.value} value={i.value}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      {shown.length > 0 ? (
        shown.map((r) => <ReviewRow key={r.id} review={r} />)
      ) : (
        <p className="bg-secondary py-8 text-center text-xs font-medium text-primary">
          No reviews match your search. Try another keyword or rating.
        </p>
      )}

      {pages > 1 && (
        <nav aria-label="Review pages" className="flex justify-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === current ? "page" : undefined}
              onClick={() => setPage(n)}
              className={cn(
                "flex size-9 items-center justify-center type-label-xs leading-5 font-semibold text-primary",
                n === current ? "border border-border-subtle bg-background" : "hover:bg-secondary",
              )}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

/* ───────────────────────── Questions & Answers ───────────────────────── */

function Meta({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="size-1 rounded-full bg-border-subtle" />}
          {item}
        </span>
      ))}
    </div>
  )
}

function RolePill({ children }: { children: React.ReactNode }) {
  // Figma: #2F2F2F pill, 8px radius — closest tokens: primary, rounded-xs.
  return <span className="rounded-xs bg-primary px-3.5 py-0.5 text-xxs leading-3 tracking-[1px] text-primary-foreground uppercase">{children}</span>
}

function AnswerForm({ onSubmit, onCancel }: { onSubmit: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6 border-t border-muted p-4">
      <div className="flex flex-col gap-2">
        <Textarea
          aria-label="Your answer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-24"
          autoFocus
        />
        <p className="flex items-center gap-1 type-caption text-primary">
          <img src="/images/reviews/info-icon.svg" alt="" className="size-3.5" />
          Do not include HTML, links, references to other stores, pricing, or contact info.
        </p>
      </div>
      <div className="flex gap-2">
        <Button className="px-6" disabled={!text.trim()} onClick={() => onSubmit(text.trim())}>
          Submit
        </Button>
        <Button variant="ghost" className="px-6" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function QuestionItem({ question }: { question: Question }) {
  const [votes, setVotes] = useState(question.votes)
  const [voted, setVoted] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [answering, setAnswering] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>(question.bestAnswer ? [question.bestAnswer] : [])
  const comments = question.comments ?? []
  const visibleComments = showAll ? comments : comments.slice(0, 4)

  const notInTest = useNotInTest()
  const inert = (what: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    notInTest(what)
  }
  return (
    <article className="flex flex-col border-t border-border-subtle pt-4">
      <div className="flex items-start pb-4">
        <div className="flex w-14 shrink-0 justify-center">
          {question.comments ? (
            <img src="/images/reviews/icon-question.svg" alt="" className="size-5" />
          ) : (
            <button
              type="button"
              aria-pressed={voted}
              aria-label={`Vote up this question (${votes} votes)`}
              onClick={() => {
                setVotes((v) => v + (voted ? -1 : 1))
                setVoted((v) => !v)
              }}
              className={cn("flex flex-col items-center py-1 text-base font-bold text-primary", voted && "opacity-60")}
            >
              <img src="/images/reviews/icon-vote-up.svg" alt="" className="size-5" />
              {votes}
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {/* Figma Body/L semibold, line-height 1.2 → closest token leading-5. */}
          <h4 className="font-sans text-lg leading-5 font-semibold tracking-[-0.45px] text-foreground">{question.title}</h4>
          <div className="type-caption text-primary">
            <Meta
              items={[
                <span key="author" className="flex items-center gap-2">
                  {question.author}
                  {question.authorRole && <RolePill>{question.authorRole}</RolePill>}
                </span>,
                ...(question.date ? [formatReviewDate(question.date)] : []),
              ]}
            />
          </div>
          {answers.map((a, i) => (
            <div key={i} className="flex flex-col gap-1 pt-5">
              <p className="text-base text-primary">
                {i === 0 && question.bestAnswer && <span className="font-semibold">Best Answer: </span>}
                {a.text}
              </p>
              <div className="pb-4 text-xs text-primary">
                <Meta
                  items={[
                    <span key="author" className="flex items-center gap-1">
                      {a.author}
                      {a.role && <RolePill>{a.role}</RolePill>}
                    </span>,
                    formatReviewDate(a.date),
                    <a key="reply" href="#" onClick={inert("Replying")} className="font-medium underline">
                      Reply
                    </a>,
                    <a key="flag" href="#" onClick={inert("Flagging an answer")} className="font-medium underline">
                      Inaccurate
                    </a>,
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col pb-1 pl-14">
        {comments.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2">
            {visibleComments.map((c) => (
              <li key={c.author} className="flex py-4 pr-4">
                <span className="flex w-12 shrink-0 justify-center pt-px">
                  <img src="/images/reviews/icon-quote.svg" alt="" className="size-4" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-base text-secondary-foreground">{c.text}</span>
                  <span className="text-xs text-primary">
                    <Meta items={[<span key="author" className="font-medium">{c.author}</span>, formatReviewDate(c.date)]} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-muted p-2.5">
          {comments.length > 4 ? (
            <button type="button" onClick={() => setShowAll((s) => !s)} className="flex items-center gap-1 py-1 text-xs font-medium text-primary">
              <img src="/images/reviews/icon-expand.svg" alt="" className="size-4" />
              {showAll ? "Show fewer comments" : `See all ${comments.length} comments`}
            </button>
          ) : (
            <button
              type="button"
              aria-expanded={answering}
              onClick={() => setAnswering((a) => !a)}
              className="flex items-center gap-1 py-1 text-xs font-medium text-primary"
            >
              <img src="/images/reviews/icon-answer.svg" alt="" className="size-4" />
              Answer
            </button>
          )}
        </div>
        {answering && (
          <AnswerForm
            onCancel={() => setAnswering(false)}
            onSubmit={(text) => {
              setAnswers((list) => [...list, { text, author: "You", date: new Date().toISOString().slice(0, 10) }])
              setAnswering(false)
            }}
          />
        )}
      </div>
    </article>
  )
}

function QuestionsAndAnswers({ questions }: { questions: Question[] }) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"common" | "recent">("common")
  const q = query.trim().toLowerCase()
  const list = useMemo(() => {
    const matches = questions.filter(
      (x) =>
        !q ||
        [x.title, x.bestAnswer?.text, ...(x.comments ?? []).map((c) => c.text)].join(" ").toLowerCase().includes(q),
    )
    return sort === "recent"
      ? [...matches].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      : matches
  }, [questions, q, sort])

  const notInTest = useNotInTest()
  const inert = (what: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    notInTest(what)
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="qa" className="text-sm font-semibold text-primary">
          Have a question about this? Ask experts.
        </label>
        <Input id="qa" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 type-caption text-primary">
            <img src="/images/reviews/info-icon.svg" alt="" className="size-3.5" />
            Start typing and see existing answers.
          </span>
          <a href="#" onClick={inert("Q&A guidelines")} className="text-xs font-medium text-primary underline">
            Learn more
          </a>
        </div>
        <div className="flex items-center gap-4 rounded-xs bg-bg-input-50 px-3.5 py-3">
          <p className="text-sm leading-none font-medium text-accent-foreground" aria-live="polite">
            {list.length} Question{list.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={() => setSort((s) => (s === "common" ? "recent" : "common"))}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
          >
            {sort === "common" ? "Most Common" : "Most Recent"}
            <img src="/images/reviews/icon-sort-caret.svg" alt="" className="size-2.5" />
          </button>
        </div>
      </div>
      {list.length > 0 ? (
        <div className="flex flex-col gap-1">
          {list.map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <p className="bg-secondary py-8 text-center text-xs font-medium text-primary">
          No existing answers match “{query}”.
        </p>
      )}
    </div>
  )
}

/* ───────────────────────── Block ───────────────────────── */

export function ReviewsBlock() {
  return (
    <section className="flex flex-col gap-14 bg-background px-margin py-14">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <h2 className="type-h3 font-medium text-primary">Reviews</h2>
        <ReviewSummary reviews={SETTING_REVIEWS} />
        <ReviewListing reviews={SETTING_REVIEWS} />
      </div>
      <div className="h-px w-full max-w-5xl bg-border-subtle" />
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <h2 className="type-h3 font-medium text-primary">Questions and Answers</h2>
        <QuestionsAndAnswers questions={SETTING_QUESTIONS} />
      </div>
    </section>
  )
}
