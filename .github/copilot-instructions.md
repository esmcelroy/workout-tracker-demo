# AI Coding Agent Instructions for FitTrack

## Project Overview
FitTrack is a React 19 + TypeScript workout tracking application built with Vite. It features a tabbed interface (Plans, Workout, Progress, Library) with mobile bottom-navigation. Data is persisted via a lightweight Express backend with JSON file storage, designed to scale to cloud backends (Firebase, Supabase, etc.) without component-level changes.

**Key architectural principle**: React hooks + custom `usePersistentState` hook for state management with API integration, component-driven UI with Radix primitives, Tailwind CSS v4 for styling.

## Critical Files & Architecture

### State Management Pattern
- **Storage layer**: `usePersistentState<T>(key, defaultValue)` hook from `@/hooks/use-persistent-state` replaces GitHub Spark's `useKV`
- **API layer**: `src/lib/api.ts` provides generic `apiGet/apiSet/apiDelete` functions that communicate with backend
- **Backend**: `server.ts` - Express server with REST API endpoints for CRUD operations on JSON-persisted data
- **Interface compatibility**: Hook maintains same interface as GitHub Spark, so existing code works without changes
- **Examples**: 
  - `usePersistentState<WorkoutPlan[]>('workout-plans', [])` in `PlansView.tsx`
  - `usePersistentState<WorkoutSession | null>('active-session', null)` in `WorkoutView.tsx`
- **Key insight**: State updates via updater functions automatically persist: `setPlans((current) => [...])`

### Backend Architecture (`server.ts`)
- **Framework**: Express.js with CORS support
- **Storage**: JSON files in `.data/` directory (key as filename, value as JSON content)
- **Endpoints**:
  - `GET /api/data/:key` - Retrieve data for a key
  - `PUT /api/data/:key` - Store/update data for a key
  - `DELETE /api/data/:key` - Delete a key
  - `GET /api/keys` - List all stored keys
  - `POST /api/export` - Export all data as JSON backup
  - `POST /api/import` - Import data from JSON file
- **Key insight**: Designed to be swappable - same API surface works with Firebase, Supabase, or other backends
- **Atomic writes**: Uses temp files then renames to prevent corruption on failure

### Type System (`src/lib/types.ts`)
Core types that cascade through all components:
- `Exercise`: id, name, muscleGroup, difficulty, instructions[], formCues[]
- `WorkoutPlan`: exercises array with sets/reps/weight targets
- `WorkoutSession`: tracks completed sets in real-time, status: 'in-progress' | 'completed' | 'abandoned'
- `CompletedSet`: setNumber, reps, weight, completedAt timestamp

Muscle groups: `'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'cardio' | 'full-body'`

### Exercise Library (`src/lib/exercises.ts`)
- **Static data**: ~30 exercises with detailed instructions and form cues
- **Pattern**: Each exercise is pre-populated; no API calls
- **Usage**: EXERCISE_LIBRARY constant queried by exerciseId in components
- **Adding exercises**: Add to EXERCISE_LIBRARY array, then reference by id in WorkoutExercise objects

## Component Architecture

### Main Views (Top-level, rendered by `App.tsx` tabs)
1. **PlansView**: Create/edit/delete workout plans; uses Dialog + PlanEditor
2. **WorkoutView**: Active session tracking, form feedback, set logging
3. **ProgressView**: Charts (Recharts) and workout history
4. **LibraryView**: Browse/filter exercises by muscle group

### Component Patterns

**Dialog-driven editing** (Plans, Workouts):
```tsx
const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);
// Dialog content = <PlanEditor plan={editingPlan} onSave={handleSavePlan} />
```

**List operations** with KV:
```tsx
setPlans((currentPlans) => {
  const idx = currentPlans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) { updated[idx] = plan; return updated; }
  return [...currentPlans, plan];
});
```

**Motion animations** (Framer Motion v6):
- `<motion.div>`, `<AnimatePresence>` for set completion celebrations
- Spring physics: `transition={{ type: 'spring' }}`
- Keep animations purposeful—completed sets expand, exercises slide on advance

## UI & Design System

### Styling
- **Framework**: Tailwind CSS v4 + `@tailwindcss/vite` plugin
- **Components**: Radix UI primitives via `src/components/ui/*` (pre-built: Button, Card, Dialog, Input, Select, Progress, etc.)
- **Theme**: OkLCh-based color system (deep blue primary, lime green accent, slate gray secondary)
- **Classes**: Use `container`, `mx-auto` for centering; responsive classes like `md:pb-6`, `pb-24` (mobile-first)

### Mobile Responsiveness
- Desktop: Tab-based navigation (`TabsList` with 4 triggers)
- Mobile: Bottom navigation bar (`<nav>` fixed bottom-0) with 4 icon buttons
- **Detector**: `useIsMobile()` hook from `src/hooks/use-mobile.ts`
- **Pattern**: `{!isMobile && <TabsList>}` and `{isMobile && <nav>}`

### Icons
- **Library**: Phosphor Icons (`@phosphor-icons/react`)
- **Usage**: `<Barbell size={32} weight="bold" />` (size, weight variants)
- **Note**: Vite plugin auto-proxies Phosphor imports; no manual icon file imports

## Data Flows & Critical Workflows

### Workout Session Lifecycle
1. User selects plan in PlansView, clicks "Start Workout" → creates WorkoutSession in WorkoutView
2. `startWorkout(plan)` → initializes session with `status: 'in-progress'`, maps plan exercises
3. User logs sets via `completeSet(exerciseIndex, reps, weight)` → appends CompletedSet to session
4. `finishWorkout()` → saves session to persistent 'workout-sessions' KV, clears active-session
5. ProgressView queries 'workout-sessions' array for charts

### Plan Creation Flow
1. Click "New Plan" → Dialog opens, PlanEditor mounts with `plan={null}`
2. User inputs name, description, adds exercises via "Add Exercise" button
3. `handleSavePlan` → generates id if new (`plan-${Date.now()}`), stores in 'workout-plans' KV
4. Toast confirms success; Dialog closes

### Form Feedback (AI Integration)
- `getFeedback(exerciseId)` in WorkoutView calls GitHub Copilot API (or fallback model)
- Prompt includes exercise form cues; response cached in state for offline fallback
- Error handling: Show cached tips instead of error if API fails

## Build & Development

### Commands
```bash
npm run dev              # Runs both backend (port 3000) and frontend (port 5173) concurrently
npm run dev:frontend    # Frontend only (Vite dev server)
npm run dev:backend     # Backend only (Express server)
npm run build           # TypeScript check + Vite build (output: dist/)
npm run lint            # ESLint check
npm run optimize        # Pre-bundle optimization (Vite)
npm run backend         # Alias for dev:backend
```

### Backend Server
- **Entry point**: `server.ts` at project root
- **Default port**: 3000 (configurable via `PORT` env var)
- **Data directory**: `.data/` created automatically (git-ignored)
- **Environment variables**: Set in `.env.development` and `.env.production`
- **CORS enabled**: Allows requests from frontend at localhost:5173

### Build Configuration
- **Entry**: `src/main.tsx` → `index.html`
- **Plugins**: React SWC (transpiler), Tailwind Vite, Phosphor icon proxy, Spark plugin
- **Path alias**: `@` → `src/` (configured in tsconfig.json and vite.config.ts)

### TypeScript
- **Target**: ES2020
- **Strict mode**: `strictNullChecks: true`, `noFalltentryPointsInSwitch: true`
- **JSX**: React JSX transform (no React import needed)

## Common Patterns to Follow

### Creating a New Component
1. Create file in `src/components/` or `src/components/ui/` (UI primitives)
2. Use TypeScript interfaces for props
3. Import Radix primitives from `@/components/ui/*`
4. Apply Tailwind classes for layout/spacing
5. Use Phosphor icons for consistency

### Adding Workout Data
- Extend `WorkoutSession.exercises` array when creating new session
- Always include `exerciseName` string (cached from EXERCISE_LIBRARY) to avoid lookup on render
- Timestamps: Use `Date.now()` for `completedAt`, `startedAt` fields

### Error Handling
- **Toast notifications**: `toast.success()`, `toast.error()` from 'sonner'
- **Empty states**: Check array length; show Card with helpful onboarding message
- **Fallback data**: EXERCISE_LIBRARY is hardcoded, never null

### Performance Notes
- KV updates via updater functions (not synchronous mutations) to ensure React re-renders
- Motion animations use Framer Motion v6 with `type: 'spring'` for snappy feel
- Recharts for progress charts; lazy-load if needed for large datasets

## Key Dependencies & Integration Points

| Package | Purpose | Critical Files |
|---------|---------|-----------------|
| `express` | Backend web server | `server.ts` |
| `cors` | Enable cross-origin requests | `server.ts` |
| `react` & `react-dom` | UI framework | `src/main.tsx` |
| `@radix-ui/*` | Unstyled components | `src/components/ui/*` |
| `tailwindcss` & `@tailwindcss/vite` | Styling | `tailwind.config.js`, `src/styles/` |
| `framer-motion` | Animations | WorkoutView, PlansView |
| `recharts` | Charts | ProgressView |
| `sonner` | Toast notifications | All major actions |
| `@phosphor-icons/react` | Icons | All UI components |
| `zod` & `@hookform/resolvers` | Form validation | PlanEditor (if advanced forms added) |
| `concurrently` | Run backend + frontend simultaneously | Development scripts |
| `ts-node` | Run TypeScript directly | Backend execution |

## Testing & Debugging

- **Unit tests**: Vitest + Testing Library with jsdom. Config in [vitest.config.ts](../vitest.config.ts); globals and setup in [tests/setup.ts](../tests/setup.ts) (includes `@testing-library/jest-dom`, cleanup, mocks for `fetch`, `localStorage`, and `matchMedia`). Use [tests/test-utils.tsx](../tests/test-utils.tsx) `render()` wrapper for providers.
- **Run unit tests**: `npm test` (headless), `npm run test:ui` (Vitest UI), `npm run test:coverage` (V8 coverage).
- **E2E tests**: Playwright configured in [playwright.config.ts](../playwright.config.ts). First run `npx playwright install`. Start the app (`npm run dev`) then run `npm run test:e2e`.
- **Debugging**: React DevTools + VS Code Debugger (attach to Vite port 5173)
- **State inspection**: Open browser DevTools → localStorage to view KV data
- **Network requests**: Check Console for Copilot API calls in getFeedback

### TDD Practices (Required)
- Write a failing test before implementation (unit or e2e as appropriate).
- Implement the minimal code to make the test pass; then refactor.
- Prefer unit tests with Vitest + Testing Library; add E2E with Playwright for flows.
- Mock network I/O (`fetch`) and `localStorage` where relevant (see [tests/setup.ts](../tests/setup.ts)).
- Use [tests/test-utils.tsx](../tests/test-utils.tsx) `render()` to include providers.
- Keep tests deterministic and fast; avoid time-based flakiness.
- Include tests with feature PRs; do not merge new functionality without coverage.

