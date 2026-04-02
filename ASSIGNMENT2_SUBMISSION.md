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

My `CLAUDE.md` documents the full project: the tech stack (Vite + React 18 + TypeScript + Tailwind CSS v4), all four routes (`/`, `/app`, `/iterations`), the DynamoDB data model (TodoTask, UserPreference, UserBehaviorRecord), and key components (WeekCalendar, AIPanel, TodoPanel, EventModal).

The plan started focused on the frontend — a calendar UI with basic CRUD. But as I worked with Claude, it evolved significantly:

- **The AI agent emerged from iteration.** I started with a simple chat panel, then Claude helped me build a streaming ReAct agent with tool use, deferred execution (confirm/cancel cards), and multi-round reasoning.
- **The landing pages were a homework-driven pivot.** The plan originally had no landing page. Assignment 1 required 25 iterations, so I added 28 design explorations across 5 categories, then selected the best combo (#28) as the homepage.
- **Performance optimization reshaped the backend.** After building a testing framework that revealed 4.6s average TTFT, the plan expanded to include Redis caching (Upstash), model selection (gpt-4o-mini for standard tasks), and request parallelization — cutting TTFT to 2.7s.

The CLAUDE.md evolved from a simple "build a calendar" brief into a full architecture document that steers Claude on style preferences, component patterns, and the AI agent's deferred-execution design.

### 2. Pick one page in your app. Trace the path: what file renders it, what's the route, what components does it use, where does the data come from?

**Page: The authenticated calendar app at `/app`**

**Route resolution:**
1. User navigates to `/app`
2. `src/main.tsx` wraps `<App>` in `<BrowserRouter>`
3. `src/app/App.tsx` has `<Route path="/app/*" element={<CalendarApp />} />`
4. `CalendarApp` calls `useAuth()` — if not signed in, renders `<AuthPage>`; if signed in, renders `<MainApp>`

**Components used by `MainApp` (src/app/App.tsx lines 42-191):**
- `<TopNavigation>` — week nav arrows, "Today" button, user email dropdown
- `<Sidebar>` — mini date picker (`onDateSelect`), calendar visibility toggles, "Create" button
- `<WeekCalendar>` — 7-day grid, renders `<EventCard>` for each event, handles click/drag
- `<AIPanel>` — expandable chat panel, uses `useAgent()` hook for streaming
- `<TodoPanel>` — untimed task list, uses `useTodos()` hook
- `<EventModal>` — modal for create/edit/delete with date/time pickers

**Data flow:**
- `useAuth()` (src/app/hooks/useAuth.ts) → AWS Cognito → returns `userId` and `email`
- `useSchedules(userId)` (src/app/hooks/useSchedules.ts) → AWS AppSync (GraphQL) → DynamoDB `TodoTask` table → returns `events[]`, `addSchedule()`, `updateSchedule()`, `removeSchedule()`
- Events are filtered by calendar visibility (`EVENT_TYPE_TO_CALENDAR` mapping) before passing to `<WeekCalendar>`
- AI chat goes through `useAgent()` → `streamAgent()` → Lambda Function URL (NDJSON streaming) → agent loop → tool calls → proposed actions → user confirms → `createTodo()`/`updateTodo()`/`deleteTodo()` via AppSync

### 3. Describe one thing that happened when Claude tested your app with Playwright MCP. How did the build → verify loop change how you worked?

My project has **two layers of automated testing**, each catching different types of problems:

**Layer 1: Playwright E2E (UI verification)**

I configured Playwright (`playwright.config.ts`) with 6 end-to-end tests covering the core user-facing pages:

```
✓ Landing Page — hero section with CTA renders
✓ Landing Page — nav links navigate to /iterations
✓ Landing Page — pricing section visible after scroll
✓ Landing Page — CTA button navigates to /app
✓ Iterations Gallery — renders 25+ sections with sidebar
✓ Auth Page — shows login form at /app
```

Running `npm run test:e2e` starts the Vite dev server automatically, launches headless Chromium, and verifies all 6 interactions pass. One thing Playwright caught immediately: when I first deployed Iteration 28 as the homepage, the page couldn't scroll past the first viewport — Playwright's "pricing section visible after scroll" test failed. This traced back to `overflow: hidden` in the global `theme.css` (needed for the calendar app to prevent body scroll). The fix was a `useEffect` that overrides `overflow: auto` on mount for landing pages. Without Playwright, I might not have caught this until a real user complained.

**Layer 2: AI Agent Testing Framework (reasoning verification)**

Beyond UI, I built a custom testing framework (`testing/src/`) that tests what Playwright can't — the AI agent's reasoning quality. It uses a Tester AI (GPT-4o-mini) to simulate 5 different user personas, then a Judge AI (GPT-4o) scores each conversation on goal achievement, context retention, action correctness, and response naturalness.

**One specific discovery:** The "regression-empty-calendar" fixture (user asks "今天有什么安排?" with no tasks) scored 2/10. The agent was generating verbose, unhelpful responses instead of simply saying "no tasks today." This led me to add explicit guidance in the system prompt.

**How it changed my workflow:** The build → test → analyze → fix loop became data-driven. Instead of manually testing, I'd run `npm run test:fixtures` (15 deterministic scenarios), read the HTML report, identify the lowest-scoring scenarios, fix the issue, and re-run. The framework also supports **A/B testing** — running the same fixtures against two different prompt versions with side-by-side comparison of scores, latency, and token usage.
