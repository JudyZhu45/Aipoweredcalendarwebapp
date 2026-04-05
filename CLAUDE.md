# BeaverAI — AI-Powered Calendar Web App

## What This Is
BeaverAI is a full-stack AI calendar assistant. Users chat with an AI agent ("Beaver") that creates, updates, deletes, and analyzes their schedule. The app features a weekly calendar view, a to-do panel, a routines/habits panel, an AI chat panel, and 28 landing page design iterations.

**Tech stack:** Vite 6 + React 18 + TypeScript + Tailwind CSS v4 + React Router v7
**Backend:** AWS Lambda (streaming), AppSync (GraphQL), DynamoDB, OpenAI GPT-4o/4o-mini, Upstash Redis
**Auth:** AWS Cognito (email + password) via AWS Amplify v6
**Deployment:** Vercel (frontend), AWS CDK (backend)
**Testing:** Playwright (E2E)

> Note: This project uses Vite + React Router instead of Next.js. The routing, component architecture, and deployment patterns are equivalent — we chose Vite because the project started as a React Native companion web app with Amplify.

---

## Development Workflow

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build
npm run test:e2e     # Run Playwright E2E tests (requires dev server running)
```

**Environment variables** — copy `.env.example` to `.env.local` and fill in:
```
VITE_AGENT_STREAM_URL=https://your-lambda-function-url.on.aws/
VITE_AWS_REGION=us-east-1
VITE_APPSYNC_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
VITE_APPSYNC_API_KEY=da2-xxxxxx
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxx
```

---

## Directory Structure

```
src/
├── main.tsx                      # React entry point
├── app/
│   ├── App.tsx                   # Root routing + MainApp layout
│   ├── components/
│   │   ├── AIPanel.tsx           # Streaming chat, action confirmation cards
│   │   ├── AuthPage.tsx          # Login / signup / email-confirm flows
│   │   ├── EventCard.tsx         # Rendered event in calendar grid
│   │   ├── EventModal.tsx        # Create / edit / delete event modal
│   │   ├── MiniCalendar.tsx      # Month picker (React Day Picker)
│   │   ├── RightPanel.tsx        # Tab switcher: Todo | Routines
│   │   ├── RoutinePanel.tsx      # Recurring habits/routines management
│   │   ├── Sidebar.tsx           # Mini calendar + calendar category toggles
│   │   ├── TodoPanel.tsx         # Untimed tasks list
│   │   ├── TopNavigation.tsx     # Week nav + user profile menu
│   │   ├── WeekCalendar.tsx      # 7-day grid with hourly slots
│   │   ├── Button.tsx            # Custom button component
│   │   ├── Input.tsx             # Custom input component
│   │   ├── Select.tsx            # Custom select component
│   │   ├── ui/                   # 55+ shadcn/ui components (Radix UI based)
│   │   └── figma/
│   │       └── ImageWithFallback.tsx
│   ├── hooks/
│   │   ├── useAgent.ts           # AI streaming + deferred action execution
│   │   ├── useAuth.ts            # Cognito auth state machine
│   │   ├── useCustomCategories.ts
│   │   ├── useRoutines.ts        # Recurring routines CRUD
│   │   ├── useSchedules.ts       # Calendar events CRUD
│   │   └── useTodos.ts           # Untimed task CRUD
│   ├── landing/
│   │   ├── iterations/           # Iteration01.tsx … Iteration28.tsx
│   │   │   └── index.ts          # ITERATIONS array registry
│   │   ├── shared/
│   │   │   ├── LandingNav.tsx
│   │   │   ├── LandingFooter.tsx
│   │   │   └── SectionDivider.tsx
│   │   └── IterationsShowcase.tsx # Gallery at /iterations
│   └── utils/
│       └── cn.ts                 # clsx + tailwind-merge helper
├── lib/
│   ├── agent.ts                  # streamAgent() async generator for Lambda
│   ├── amplify.ts                # AWS Amplify init (Cognito + AppSync)
│   ├── api.ts                    # AppSync GraphQL CRUD for tasks & routines
│   ├── dates.ts                  # Naive ISO datetime helpers
│   └── routine-tasks.ts          # Generate task instances from routines
└── styles/
    ├── index.css                 # Imports fonts, tailwind, theme
    ├── tailwind.css              # @import "tailwindcss"
    ├── theme.css                 # CSS custom properties (colors, tokens)
    └── fonts.css                 # Reserved for font imports

e2e/
└── landing.spec.ts               # Playwright E2E tests

guidelines/
└── Guidelines.md                 # Design system reference
```

---

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Iteration28.tsx` | Landing page — animated hero, problem/solution, pricing |
| `/iterations` | `IterationsShowcase.tsx` | Gallery of all 28 landing page iterations |
| `/app` (unauthenticated) | `AuthPage` | Login / register / confirm email |
| `/app` (authenticated) | `MainApp` | Full calendar app layout |

**MainApp layout** (all rendered at `/app`):
- `TopNavigation` — week navigation arrows, current week label, user dropdown
- `Sidebar` — mini calendar date picker, calendar category filter toggles
- `WeekCalendar` — main 7-day grid (center, flex-grow)
- `AIPanel` — collapsible right-side chat panel
- `RightPanel` — Todo and Routines tabs (far right)
- `EventModal` — overlay modal (portaled, shown when editing/creating an event)

---

## Data Model

### TodoTask (DynamoDB via AppSync)
```
id: string (UUID)
title: string
description: string
isCompleted: boolean
dueDate: string (naive ISO — local time, no Z)
startTime?: string (naive ISO — set for scheduled events, absent for todos)
endTime?: string (naive ISO)
priority: 'high' | 'medium' | 'low'
eventType: 'work' | 'personal' | 'health' | 'fitness' | 'social' | 'learning' | 'family' | 'other'
isFromRoutine: boolean
routineId?: string
userId: string
createdAt: string
updatedAt: string
_version: number   ← optimistic locking for DataStore conflict detection
_deleted: boolean  ← soft-delete tombstone
```
**Todos vs Schedules:** Same DynamoDB table. Items with `startTime`/`endTime` are calendar events (schedules); items without are todos.

### Routine (DynamoDB via AppSync)
```
id: string
title: string
description: string
routineType: 'Schedule' | 'Todo'
frequency: 'Daily' | 'Weekly' | 'Monthly'
weekdays: number[]   ← 1–7 where 1=Sunday
monthDays: number[]  ← 1–31
startTimeHour: number
startTimeMinute: number
endTimeHour: number
endTimeMinute: number
eventType: string
isActive: boolean
startDate: string (ISO)
endDate?: string (ISO)
userId: string
_version: number
_deleted: boolean
```

### UserPreference (DynamoDB — managed by backend)
```
category: 'schedule' | 'taskHabit' | 'lifestyle' | 'personality' | 'constraint'
content: string
confirmedCount: number
isTemporary: boolean
expiresAt?: string
```

### UserBehaviorRecord (DynamoDB — managed by backend)
```
behaviorType: 'taskCreated' | 'taskCompleted' | 'taskDeleted' | 'taskUpdated'
hourOfDay: number
actualCompletionHour: number
taskAgeInDays: number
eventType: string
```

---

## Key Components

### WeekCalendar (`src/app/components/WeekCalendar.tsx`)
- Renders a 7-column × 24-row hourly grid
- Overlap detection algorithm assigns events to columns within the same time slot
- Drag-to-create: mousedown → drag → mouseup creates a new event in that slot
- Current time indicator (horizontal line)
- Calls `onEventClick(event)` and `onSlotClick(date, hour)` props

### AIPanel (`src/app/components/AIPanel.tsx`)
- Collapsible (CSS width transition, not unmounted)
- Streams tokens via `useAgent` → renders with `ReactMarkdown`
- Thinking steps UI: rounds counter + progress display for ReActLoop mode
- Action confirmation cards: pending actions rendered with Confirm/Cancel buttons
- Mode toggle: "standard" (gpt-4o-mini, SimpleLoop) vs "deep_thinking" (gpt-4o, ReActLoop)
- Copy-to-clipboard on individual messages

### TodoPanel (`src/app/components/TodoPanel.tsx`)
- Displays tasks without `startTime`/`endTime`
- Filtering by priority and eventType
- Completion toggle (strikethrough + color fade)
- Inline delete

### RoutinePanel (`src/app/components/RoutinePanel.tsx`)
- Create / edit / toggle-active recurring habits
- Generates individual task instances via `routine-tasks.ts`

### EventModal (`src/app/components/EventModal.tsx`)
- Full form: title, description, date, start/end time, priority, eventType
- Opens in create mode (from calendar slot click) or edit mode (from event click)
- Delete confirmation flow

### AuthPage (`src/app/components/AuthPage.tsx`)
- Three steps: `signIn`, `signUp`, `confirmSignUp`
- Email + password with Cognito validation
- Resend confirmation code button

---

## Hooks

### `useAgent(userId)` — `src/app/hooks/useAgent.ts`
Manages the full AI streaming conversation lifecycle.

```ts
const {
  messages,          // ChatMessage[]
  isLoading,         // boolean (stream in flight)
  error,             // string | null
  send,              // (text: string, mode?: 'standard'|'deep_thinking') => void
  clearHistory,      // () => void
  pendingConfirmation, // PendingConfirmation | null
  confirmActions,    // () => Promise<void>
  dismissActions,    // () => void
} = useAgent(userId);
```

- Maintains `rawHistoryRef` (OpenAI message format) for context
- `requestIdRef`: idempotency key per send call
- After stream ends with `actions` event, stores them as `pendingConfirmation`
- `confirmActions()` executes all actions against AppSync

### `useAuth()` — `src/app/hooks/useAuth.ts`
```ts
const { step, user, error, pendingEmail, login, register, confirmCode, resendCode, logout, isSignedIn, isLoading } = useAuth();
```
- `step`: `'signIn' | 'signUp' | 'confirmSignUp'`
- Checks Cognito session on mount

### `useTodos(userId, refreshKey)` — `src/app/hooks/useTodos.ts`
```ts
const { todos, loading, error, addTodo, toggleTodo, removeTodo } = useTodos(userId, refreshKey);
```
- Fetches from AppSync, filters by userId, excludes items with startTime (those are schedules)

### `useSchedules(userId, refreshKey)` — `src/app/hooks/useSchedules.ts`
- Same pattern as `useTodos` but returns only items with `startTime`/`endTime`

### `useRoutines(userId)` — `src/app/hooks/useRoutines.ts`
- CRUD for Routine records

### `useCustomCategories(userId)` — `src/app/hooks/useCustomCategories.ts`
- Custom event type management

---

## Library Utilities (`src/lib/`)

### `agent.ts` — `streamAgent()`
Async generator that connects to the Lambda Function URL and yields parsed NDJSON events:
```ts
type AgentEvent =
  | { type: 'thinking'; content: string }
  | { type: 'token'; content: string }
  | { type: 'actions'; actions: Action[] }
  | { type: 'done' }
  | { type: 'error'; message: string }
```
Supports a `resumeOffset` parameter for reconnection after interruption.

### `api.ts` — AppSync GraphQL CRUD
- `fetchTodos(userId)` / `createTodo(input)` / `updateTodo(input)` / `deleteTodo(id, version)`
- `fetchRoutines(userId)` / `createRoutine(input)` / `updateRoutine(input)` / `deleteRoutine(id, version)`
- All mutations use `_version` for optimistic locking

### `dates.ts` — Naive ISO helpers
```ts
fromNaiveISO(str: string): Date   // Parses "2024-01-15T09:00:00" as local time
toNaiveISO(date: Date): string    // Formats as "2024-01-15T09:00:00" (no Z)
```
**Critical:** Never use `new Date(isoString)` directly — the `Z` suffix forces UTC interpretation. Always use `fromNaiveISO`. "5am always means 5am on your clock."

### `routine-tasks.ts`
- `generateTasks(routine, userId)` — creates TodoTask instances for the current/upcoming period
- `deleteFutureRoutineTasks(routineId, userId)` — cleans up on deactivation
- `deleteAllRoutineTasks(routineId, userId)` — cleans up on deletion

### `amplify.ts`
Initializes AWS Amplify with Cognito User Pool + AppSync endpoint from `VITE_*` env vars. Must be imported before any `useAuth` / `api.ts` usage. Imported in `main.tsx`.

---

## AI Agent Architecture

### Streaming Flow
```
User message
  → useAgent.send()
  → streamAgent() (Lambda Function URL, POST)
  → NDJSON stream of events
  → token events: append to AI message bubble
  → thinking events: show thinking UI
  → actions event: store as pendingConfirmation
  → done event: finalize
```

### Agent Loops (backend)
- **SimpleLoop** (mode=`standard`): single-pass, gpt-4o-mini, fast responses
- **ReActLoop** (mode=`deep_thinking`): multi-round reasoning (max 5), gpt-4o, shows round counter

### Available Tools (backend)
`get_tasks`, `create_task`, `update_task`, `delete_task`, `complete_task`,
`create_routine`, `update_routine`, `delete_routine`,
`get_energy_profile`, `get_preferences`, `record_behavior`

### Deferred Execution Pattern
Actions from the AI are **never auto-applied**. The flow is:
1. AI stream ends with `{ type: 'actions', actions: [...] }`
2. `useAgent` stores these in `pendingConfirmation`
3. `AIPanel` renders confirmation cards for each action
4. User clicks **Confirm** → `confirmActions()` executes AppSync mutations
5. User clicks **Cancel** → `dismissActions()` clears them

### Redis Caching (backend, Upstash)
| Key | TTL |
|-----|-----|
| TimeWindow (scheduling context) | 24h |
| Tasks list | 2 min |
| Behavior records | 10 min |
| User preferences | 30 min |

---

## Style System

### Theme Variables (`src/styles/theme.css`)
- **Primary / brand:** `#8b6914` (golden brown) → CSS var `--primary`
- **Landing background:** `#fdf8ef` (warm cream)
- **Calendar app:** white background, subtle gray borders
- **Event type colors:** Each eventType has a dedicated CSS variable (blue=work, purple=personal, pink=health, orange=fitness, etc.)
- **Border radius:** `--radius: 0.625rem`
- Dark mode: all variables re-declared under `.dark`

### Tailwind v4
- Configured via `@tailwindcss/vite` plugin (not `postcss`)
- `@` path alias → `src/`
- No `tailwind.config.js` — configuration is in CSS via `@theme` blocks

### Conventions
- CSS-only animations preferred (`@keyframes` in `theme.css` or inline `<style>`)
- No page-level scroll: `html, body, #root` are `height: 100%; overflow: hidden`
- Custom scrollbars styled via CSS in components
- `cn()` utility (`src/app/utils/cn.ts`) wraps `clsx` + `tailwind-merge` — always use for conditional class names

---

## Landing Page Iterations

28 design variants in `src/app/landing/iterations/Iteration01.tsx` … `Iteration28.tsx`.

**Current production page:** `Iteration28` (route `/`)

**Iteration categories:**
- Layout/composition: hero, split, bento, grid, magazine
- Visual style: brand colors, dark mode, glass morphism, minimal
- Content strategy: feature-first, social-proof, demo-first, comparison
- Motion: typewriter, scroll-reveal, parallax, particle backgrounds
- Sections: FAQ, pricing, testimonials, timeline, comparison table

`IterationsShowcase` at `/iterations`:
- All 28 stacked vertically with section dividers
- Sticky sidebar index on desktop (IntersectionObserver highlights active)
- Mobile: select dropdown to jump to iteration

When creating a new iteration:
1. Add `IterationNN.tsx` to `src/app/landing/iterations/`
2. Add it to `src/app/landing/iterations/index.ts` ITERATIONS array

---

## Testing

### Playwright E2E (`e2e/landing.spec.ts`)
```bash
npm run test:e2e    # Runs against http://localhost:5173 (auto-starts dev server)
```

**Test coverage:**
- Landing page: hero renders, nav links, pricing section visible, CTA navigates to `/app`
- Iterations gallery: renders with sidebar, multiple sections
- Auth page: shows login form at `/app`

---

## Deployment

### Frontend (Vercel)
- `vercel.json` rewrites all routes to `index.html` for SPA client-side routing
- `npm run build` → `dist/` → deployed to Vercel

### Backend (AWS CDK)
- Lambda Function URL for AI streaming (`VITE_AGENT_STREAM_URL`)
- AppSync + DynamoDB for data persistence
- Cognito User Pool for authentication

---

## Key Conventions for AI Assistants

1. **Date/time:** Always use `fromNaiveISO` / `toNaiveISO` from `src/lib/dates.ts`. Never `new Date(isoString)` or `date.toISOString()` for user-facing times.

2. **GraphQL mutations:** Always include `_version` in update/delete calls. Fetch current `_version` before updating.

3. **Todos vs Schedules:** Same DynamoDB table. Presence of `startTime` distinguishes them. Don't filter at query level — filter in the hook.

4. **New components:** Place in `src/app/components/`. Use `cn()` for all conditional class names.

5. **New hooks:** Place in `src/app/hooks/`. Follow the `{ data, loading, error, ...actions }` return pattern.

6. **Styling:** Use Tailwind utility classes. Add brand/token values to `theme.css` CSS vars, not hardcoded hex values in components.

7. **AI actions:** New action types require changes in both the Lambda backend (tool definition) and `useAgent.ts` (`confirmActions` switch/case).

8. **No auto-confirmation:** The deferred confirmation pattern is intentional — never auto-execute AI-proposed actions without user approval.

9. **shadcn/ui components:** Located in `src/app/components/ui/`. These are copied source files (not npm package), so they can be edited directly. Check here before building new primitives.

10. **Routing:** Uses React Router v7 (`<Routes>` / `<Route>`). Add new routes in `src/app/App.tsx`.
