# BeaverAI — AI-Powered Calendar Web App

## What This Is
BeaverAI is a full-stack AI calendar assistant. Users chat with an AI agent ("Beaver") that creates, updates, deletes, and analyzes their schedule. The app features a weekly calendar view, a to-do panel, an AI chat panel, and 28 landing page design iterations.

**Tech stack:** Vite + React 18 + TypeScript + Tailwind CSS v4 + React Router v7
**Backend:** AWS Lambda (streaming), DynamoDB, OpenAI GPT-4o/4o-mini, Upstash Redis
**Auth:** AWS Cognito (email + password)
**Deployment:** Vercel (frontend), AWS CDK (backend)

> Note: This project uses Vite + React Router instead of Next.js. The routing, component architecture, and deployment patterns are equivalent — we chose Vite because the project started as a React Native companion web app with Amplify.

## Pages & Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/landing/iterations/Iteration28.tsx` | Landing page — animated hero, problem/solution, pricing |
| `/app` | `src/app/App.tsx` → `CalendarApp` | Auth gate → main calendar app |
| `/app` (authenticated) | `src/app/App.tsx` → `MainApp` | Weekly calendar + sidebar + AI chat + todo panel |
| `/iterations` | `src/app/landing/IterationsShowcase.tsx` | Gallery of 28 landing page iterations with sticky sidebar |

## Data Model

### TodoTask (DynamoDB)
- `id` (UUID), `title`, `description`, `dueDate` (ISO), `startTime`, `endTime`
- `priority` (high/medium/low), `eventType` (work/personal/health/fitness/social/learning/family/other)
- `isCompleted`, `userId`, `_version` (optimistic locking)

### UserPreference (DynamoDB)
- `category` (schedule/taskHabit/lifestyle/personality/constraint)
- `content`, `confirmedCount`, `isTemporary`, `expiresAt`

### UserBehaviorRecord (DynamoDB)
- `behaviorType` (taskCreated/taskCompleted/taskDeleted/taskUpdated)
- `hourOfDay`, `actualCompletionHour`, `taskAgeInDays`, `eventType`

## Key Components

- `WeekCalendar` — 7-day calendar grid with drag-to-create and event click
- `AIPanel` — streaming chat with the Beaver AI agent (confirm/cancel actions)
- `TodoPanel` — untimed task list with completion toggles
- `EventModal` — create/edit/delete events with time pickers
- `Sidebar` — mini calendar, calendar filters, create button
- `TopNavigation` — week navigation, user menu, logout
- `AuthPage` — login/register/confirm flows via Cognito

## Style Preferences

- Brand color: `#8b6914` (golden brown)
- Warm cream backgrounds `#fdf8ef` on landing pages
- Clean, minimal UI for the calendar app (white bg, subtle borders)
- CSS-only animations preferred (keyframes, transitions)
- No external UI libraries — pure Tailwind

## AI Agent Architecture

- **Streaming:** Lambda Function URL → NDJSON → token-by-token rendering
- **Agent loops:** SimpleLoop (standard, gpt-4o-mini) and ReActLoop (deep thinking, gpt-4o, max 5 rounds)
- **Tool use:** get_tasks, create_task, update_task, delete_task, complete_task, get_energy_profile, etc.
- **Deferred execution:** Actions are proposed by AI, shown as confirmation cards, executed only after user clicks confirm
- **Caching:** Upstash Redis with differentiated TTLs (TimeWindow 24h, Tasks 2min, Behavior 10min, Preferences 30min)
