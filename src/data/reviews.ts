/**
 * Mock reviews & Q&A for the Timeless Solitaire setting.
 * Every count, average and percentage on the page is derived from these arrays.
 */

export interface Review {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  body: string
  author: string
  verified: boolean
  age?: string
  gender?: string
  location?: string
  /** ISO date the review was posted */
  date: string
  /** ISO date of purchase */
  purchasedOn: string
  photos?: string[]
}

const P = "/assets/reviews"

export const SETTING_REVIEWS: Review[] = [
  {
    id: "r1",
    rating: 5,
    title: "Exactly the classic look we wanted",
    body: "We went back and forth between a few settings and this one let the diamond be the star. The band is slim but feels solid, and the yellow gold is warm without looking brassy. My fiancée hasn't stopped looking at it.",
    author: "Daniel R",
    verified: true,
    age: "25-34",
    gender: "Male",
    location: "Denver, CO, USA",
    date: "2026-10-28",
    purchasedOn: "2026-10-02",
    photos: [`${P}/photo-1.png`, `${P}/photo-2.png`],
  },
  {
    id: "r2",
    rating: 5,
    title: "Sits low and doesn't snag",
    body: "I work with my hands and was worried about prongs catching on everything. This setting sits low enough that it hasn't been a problem at all. Comfortable to wear every day.",
    author: "Priya S",
    verified: true,
    age: "25-34",
    gender: "Female",
    location: "Aurora, CO, USA",
    date: "2026-10-14",
    purchasedOn: "2026-09-20",
  },
  {
    id: "r3",
    rating: 4,
    title: "Beautiful, but thinner than I expected",
    body: "Gorgeous ring and the store team was great. The band is a little thinner than it looked online, so I'd suggest trying it on in person if you prefer something chunkier. Still very happy with it.",
    author: "Megan T",
    verified: true,
    age: "35-44",
    gender: "Female",
    location: "Salt Lake City, UT, USA",
    date: "2026-09-30",
    purchasedOn: "2026-09-05",
  },
  {
    id: "r4",
    rating: 5,
    title: "Great with a 1.5 ct oval",
    body: "Paired it with a 1.5 ct lab-grown oval and it looks stunning. The four prongs hold the stone securely and you can see a lot of the diamond from the side.",
    author: "Jordan K",
    verified: true,
    age: "25-34",
    gender: "Male",
    location: "Scottsdale, AZ, USA",
    date: "2026-09-12",
    purchasedOn: "2026-08-22",
    photos: [`${P}/photo-3.png`],
  },
  {
    id: "r5",
    rating: 5,
    title: "Timeless for a reason",
    body: "Simple, elegant, and it goes with everything. I stacked it with a pavé band for the wedding and they fit together perfectly.",
    author: "Alicia M",
    verified: true,
    age: "25-34",
    gender: "Female",
    location: "Portland, OR, USA",
    date: "2026-08-25",
    purchasedOn: "2026-07-30",
  },
  {
    id: "r6",
    rating: 5,
    title: "Resizing was quick and free",
    body: "We guessed the size wrong for the proposal. The store resized it in about a week at no cost and it came back looking brand new.",
    author: "Chris L",
    verified: true,
    age: "35-44",
    gender: "Male",
    location: "Boise, ID, USA",
    date: "2026-08-03",
    purchasedOn: "2026-06-18",
  },
  {
    id: "r7",
    rating: 5,
    title: "Designing it online was easy",
    body: "Building the ring step by step made it easy to compare options without feeling pressured. Picked it up in store and it was even prettier in person.",
    author: "Samantha G",
    verified: true,
    age: "18-24",
    gender: "Female",
    location: "Greenwood Village, CO, USA",
    date: "2026-07-19",
    purchasedOn: "2026-06-30",
    photos: [`${P}/photo-4.png`],
  },
  {
    id: "r8",
    rating: 5,
    title: "Holding up beautifully",
    body: "Six months of daily wear and it still looks great. Took it in for a free cleaning and inspection and they checked every prong.",
    author: "Ethan W",
    verified: true,
    age: "25-34",
    gender: "Male",
    location: "Fort Collins, CO, USA",
    date: "2026-06-27",
    purchasedOn: "2025-12-14",
  },
  {
    id: "r9",
    rating: 4,
    title: "Lovely ring, shipping took a few extra days",
    body: "The ring itself is perfect. Shipping took a couple of days longer than the estimate, but customer service kept me updated the whole time.",
    author: "Natalie B",
    verified: true,
    age: "25-34",
    gender: "Female",
    location: "Austin, TX, USA",
    date: "2026-05-22",
    purchasedOn: "2026-05-01",
  },
  {
    id: "r10",
    rating: 5,
    title: "She said yes!",
    body: "Proposed last month and she loves it. The setting makes a 1 ct round look bigger than I expected.",
    author: "Marcus D",
    verified: true,
    age: "25-34",
    gender: "Male",
    location: "Albuquerque, NM, USA",
    date: "2026-04-16",
    purchasedOn: "2026-03-09",
    photos: [`${P}/photo-2.png`],
  },
  {
    id: "r11",
    rating: 5,
    title: "Great value",
    body: "Compared prices at a few jewelers and this was the best value for the quality. Love that the lifetime warranty is included.",
    author: "Hannah P",
    verified: false,
    age: "35-44",
    gender: "Female",
    location: "Colorado Springs, CO, USA",
    date: "2026-03-08",
    purchasedOn: "2026-02-11",
  },
  {
    id: "r12",
    rating: 5,
    title: "Perfect everyday ring",
    body: "Low profile, comfortable, and it catches the light beautifully. I would buy it again without hesitation.",
    author: "Olivia F",
    verified: true,
    age: "45-54",
    gender: "Female",
    location: "Seattle, WA, USA",
    date: "2026-01-21",
    purchasedOn: "2025-12-28",
  },
]

export interface QuestionComment {
  text: string
  author: string
  date: string
}

export interface Answer {
  text: string
  author: string
  role?: "staff"
  date: string
}

export interface Question {
  id: string
  title: string
  author: string
  /** Pill shown after the author, e.g. STORE */
  authorRole?: "store"
  date?: string
  votes: number
  bestAnswer?: Answer
  /** Short community replies (shown in a two-column grid) */
  comments?: QuestionComment[]
}

export const SETTING_QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Why did you choose this?",
    author: "Shane Co.",
    authorRole: "store",
    votes: 0,
    comments: [
      { text: "Simple and classic.", author: "Timothy A. C", date: "2026-04-08" },
      { text: "Wanted the diamond to be the focus. This setting does exactly that.", author: "Rachael W", date: "2026-03-13" },
      { text: "Low profile, so it doesn't catch on gloves at work.", author: "Alan M", date: "2025-12-30" },
      { text: "Purchased from Shane years ago and loved the service.", author: "Charles B", date: "2025-12-18" },
      { text: "It pairs well with almost any wedding band.", author: "Jenna L", date: "2025-11-29" },
      { text: "Looked best with an oval stone when we tried them in store.", author: "Victor O", date: "2025-11-02" },
    ],
  },
  {
    id: "q2",
    title: "What center stone sizes fit this setting?",
    author: "Kayla R",
    date: "2026-08-14",
    votes: 6,
    bestAnswer: {
      text: "This setting fits center stones from 0.50 to 3.00 ct in round, oval, cushion, princess and emerald shapes. Our team adjusts the head to the exact stone you choose.",
      author: "Dallas C.",
      role: "staff",
      date: "2026-08-15",
    },
  },
  {
    id: "q3",
    title: "Can the band be engraved?",
    author: "Ben T",
    date: "2026-06-02",
    votes: 3,
    bestAnswer: {
      text: "Yes, the inside of the band can be engraved with up to 20 characters. Engraving is added in the Finishing Touches step.",
      author: "Morgan S.",
      role: "staff",
      date: "2026-06-03",
    },
  },
]

export function formatReviewDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
