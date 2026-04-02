# Assignment 2: Build Your Own Tool — Submission

**Student:** Judy Zhu
**Project:** BeaverAI — AI-Powered Calendar Web App
**Live URL:** https://aipoweredcalendarwebapp.vercel.app
**GitHub URL:** https://github.com/JudyZhu45/Aipoweredcalendarwebapp

**Test Account (for grading):**
- Email: `teacher@test.com`
- Password: `Test1234!`
- Login at: https://aipoweredcalendarwebapp.vercel.app/app

---

## Reflection Questions

### 1. What's in your CLAUDE.md? How did your plan shape what Claude built — and how did it evolve as you worked?

My CLAUDE.md covers the tech stack (Vite + React 18 + TypeScript + Tailwind v4), routes, the DynamoDB data model, key components, and style guidelines. It's become the single reference point for every conversation with Claude.

The project didn't start with a grand plan — I wanted a calendar UI with basic task management. Three things changed the direction along the way:

- The AI chat panel was originally just a nice-to-have. Once I got the streaming working, I kept pushing — tool calling, a confirm/cancel flow so the AI can't just silently modify your schedule, and a ReAct loop for harder questions. That "nice-to-have" ended up being the core feature.
- Landing pages weren't in the plan at all. Assignment 1 needed 25 iterations, so I built 28, picked the best combo, and made it the homepage. That pushed me to add React Router (which was installed but unused) and figure out the scroll-lock conflict between the calendar's `overflow: hidden` and the landing page needing normal scroll.
- Performance became a real concern after I wrote a testing framework and saw 4.6s average time-to-first-token. That led to Redis caching, switching lighter tasks to gpt-4o-mini, and parallelizing the request pipeline — brought it down to 2.7s.

The CLAUDE.md grew alongside the project. Early on it was just "build a calendar app, use golden-brown brand colors." Now it documents the agent architecture, the deferred-execution pattern, and the caching strategy, so Claude doesn't re-invent decisions I've already made.

### 2. Pick one page in your app. Trace the path: what file renders it, what's the route, what components does it use, where does the data come from?

I'll trace the main calendar page at `/app`.

**How it gets rendered:**
1. `src/main.tsx` wraps everything in `<BrowserRouter>`
2. `src/app/App.tsx` matches `/app/*` to `<CalendarApp />`
3. `CalendarApp` checks auth state via `useAuth()`. Not signed in? You see `<AuthPage>`. Signed in? You get `<MainApp>`.

**What's on screen (all in `App.tsx`, lines 42–191):**
- `TopNavigation` — the week-forward/back arrows, a "Today" button, and a dropdown showing your email with logout
- `Sidebar` — a small month calendar for date picking, colored checkboxes to toggle calendar categories, and a "Create" button
- `WeekCalendar` — the main 7-day grid. Each event is an `EventCard`. You can click a time slot or drag to create
- `AIPanel` — collapsible chat panel on the right. Uses `useAgent()` for streaming
- `TodoPanel` — lists tasks that have no scheduled time
- `EventModal` — pops up when you click an event or a time slot

**Where the data comes from:**
- Auth: `useAuth()` talks to AWS Cognito, gives back `userId` and `email`
- Tasks: `useSchedules(userId)` queries DynamoDB through AppSync (GraphQL). Returns the task list plus functions to add, update, and remove
- Before tasks hit the calendar, they're filtered through a mapping (`EVENT_TYPE_TO_CALENDAR`) so toggling "Work" on/off in the sidebar actually hides those events
- The AI chat takes a different path: `useAgent()` → `streamAgent()` → Lambda Function URL. The response streams back as NDJSON. If the agent proposes actions (like creating a task), they show up as a confirm/cancel card — nothing writes to the database until you click Confirm

### 3. Describe one thing that happened when Claude tested your app with Playwright MCP. How did the build → verify loop change how you worked?

I have two testing setups that catch different things.

**Playwright for the UI**

I wrote 6 end-to-end tests in `e2e/landing.spec.ts` — they check that the landing page renders, links work, the pricing section is reachable by scrolling, the CTA goes to `/app`, the iterations gallery shows all 25+ sections, and the auth page has a login form.

The scroll test caught a real bug. When I made Iteration 28 the homepage, users couldn't scroll past the hero section. The test "pricing section visible after scroll" failed, which pointed me to `theme.css` — it sets `overflow: hidden` on `html/body` for the calendar app (so the body doesn't scroll behind the calendar grid). Landing pages need normal scrolling, so I added a `useEffect` that flips it to `overflow: auto` on mount and restores it on unmount. Small fix, but I wouldn't have caught it without the test — the calendar app worked fine, and I wasn't manually scrolling through the landing page every time I deployed.

**A custom framework for the AI agent**

Playwright can tell me if a button renders, but it can't tell me if the AI gives a good answer. So I built a separate test runner (`testing/src/`) with 15 fixed scenarios and 5 generated ones. A "Tester AI" plays different personas (a terse power user, a student who's vague about times, someone who switches between Chinese and English), sends messages to the real agent, and then a "Judge AI" scores the conversation.

One finding that changed things: the agent scored 2/10 when asked "今天有什么安排?" on an empty calendar. It was rambling instead of just saying "nothing scheduled." I tightened the prompt, re-ran the tests, and the score went up. That loop — run fixtures, read the report, find the worst score, fix it, re-run — became my main way of improving the agent. I also set it up for A/B comparisons: run the same scenarios against two different configs and get a table showing which one scores better, responds faster, and uses fewer tokens.
