---
appliesTo:
    - "**/*.ts"
    - "**/*.tsx"
    - "!**/*.d.ts"
---

Note: This instruction file applies only to TypeScript sources (.ts, .tsx).

TypeScript Conventions (FitTrack)

1) Language and project defaults
- Target ES2020, strict mode on. No implicit any. No ts-ignore unless accompanied by a short rationale and a tracking TODO.
- Prefer explicit return types for exported functions, hooks, and components.
- Prefer unknown over any at boundaries; narrow with type guards or schema parsing.
- Use const, readonly, and ReadonlyArray to preserve immutability.

2) Types, interfaces, and unions
- Use interface for object shapes intended for extension; use type for unions, mapped/utility types, and component props.
- Prefer discriminated unions over enums for domain states (e.g., WorkoutSession.status).
- Use string literal unions for stable domain vocab (e.g., muscle groups). Reuse src/lib/types.ts; do not redefine overlapping types locally.
- Use satisfies to preserve literal types while validating shape.
- Export domain-first types from src/lib/types.ts; colocate local component-only types with the component.

Examples:
```ts
// Unions over enums
export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

// Literal union reuse
export type MuscleGroup =
    | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
    | 'legs' | 'core' | 'cardio' | 'full-body';
```

3) Nullability and guards
- Model nullable fields explicitly (T | null). Avoid undefined for optionals unless truly optional.
- Narrow before use: if (!value) return; optional chaining and nullish coalescing over || for falsy-safe logic.
- Prefer custom type guards for complex narrowing.

4) React + TS patterns
- Component props: type Props = { ... }; export function Component(props: Props): JSX.Element. Avoid React.FC; make children explicit when needed.
- Hooks:
    - Always type usePersistentState generics. Use functional updaters to ensure persistence.
    - Keep dependencies accurate. Memoize derived values with useMemo and stable callbacks with useCallback.
    - useRef<ElementType | null> and check before use; avoid non-null assertions.
- Event types: React.ChangeEvent<HTMLInputElement>, React.MouseEvent<HTMLButtonElement>, etc.

Examples:
```tsx
type PlanCardProps = { plan: WorkoutPlan; onStart: (planId: string) => void };

export function PlanCard({ plan, onStart }: PlanCardProps): JSX.Element {
    return (
        <button onClick={() => onStart(plan.id)} className="btn-primary">
            Start {plan.name}
        </button>
    );
}
```

5) State and persistence (usePersistentState)
- Always specify <T> and provide a safe default value.
- Use functional updates to guarantee atomic persistence writes.
- Keep arrays immutable; never mutate in place.

Examples:
```ts
const [plans, setPlans] = usePersistentState<WorkoutPlan[]>('workout-plans', []);

setPlans(current => {
    const idx = current.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
        const copy = [...current];
        copy[idx] = plan;
        return copy;
    }
    return [...current, plan];
});
```

6) API layer (src/lib/api.ts)
- Always pass generic type arguments: await apiGet<WorkoutPlan[]>('workout-plans').
- Validate external data at boundaries with zod; convert to internal types. Prefer DTO types for transport and map to domain types if they differ.
- Model results with typed Result or throw domain-specific errors; do not return mixed shapes.

Examples:
```ts
import { z } from 'zod';

const CompletedSetSchema = z.object({
    setNumber: z.number().int().positive(),
    reps: z.number().int().nonnegative(),
    weight: z.number().nonnegative(),
    completedAt: z.number().int(), // epoch ms
});

type CompletedSetDTO = z.infer<typeof CompletedSetSchema>;

export async function loadSessions() {
    const raw = await apiGet<unknown>('workout-sessions');
    const parsed = z.array(
        z.object({ /* …session shape… */ })
    ).parse(raw);
    return parsed;
}
```

7) Data and time
- Use epoch milliseconds (number) for timestamps (startedAt, completedAt). Convert at render.
- IDs are strings; prefer stable, prefix-based IDs: plan-${Date.now()} or crypto.randomUUID() when available.

8) Domain constants and libraries
- Keep EXERCISE_LIBRARY as a module-level const; assert with satisfies for precise types. No API calls for it.
- Cache user-facing strings needed at render time (e.g., exerciseName) on session records to avoid lookup churn.

Examples:
```ts
export const EXERCISE_LIBRARY = [
    /* ... */
] as const satisfies readonly Exercise[];
```

9) Error handling and control flow
- Use try/catch around IO (API, storage). Surface toast messages with actionable text.
- Exhaustiveness checks with never in switch over discriminated unions.
- Prefer narrow thrown errors (Error subclasses) and attach cause.

Examples:
```ts
function assertNever(x: never): never { throw new Error(`Unexpected: ${String(x)}`); }
```

10) Naming and structure
- Files: kebab-case. Types/interfaces: PascalCase. Functions/vars: camelCase. Booleans: is/has/can prefix.
- Group small related types/functions with their module; keep shared domain types in src/lib/types.ts.
- Use path alias @ for imports from src/. Avoid deep relative import chains.

11) Backend TypeScript (server.ts)
- Type route params and bodies. Use zod schemas for request parsing. Respond with typed JSON.
- Express handlers: use RequestHandler<Params, ResBody, ReqBody, Query> for clarity.

Examples:
```ts
import type { RequestHandler } from 'express';

type DataParams = { key: string };
type DataBody = unknown;

export const putData: RequestHandler<DataParams, void, DataBody> = async (req, res, next) => {
    try {
        // validate req.body…
        res.sendStatus(204);
    } catch (e) { next(e); }
};
```

12) Performance and safety
- Avoid unnecessary re-renders by memoizing heavy lists (useMemo) and stabilizing callbacks (useCallback).
- Animate intentionally with Framer Motion types; keep MotionProps minimal and typed.
- Lazy-load heavy chart modules if they grow large.

13) Linting and docs
- Follow ESLint recommendations. Fix types, not suppress errors.
- Document exported functions, hooks, and complex types with minimal JSDoc (purpose, params, returns).

Quick snippet: session update with safety
```ts
function completeSet(
    idx: number,
    set: Omit<CompletedSet, 'completedAt'>
) {
    setSession(current => {
        if (!current) return current;
        const exercises = [...current.exercises];
        const target = exercises[idx];
        if (!target) return current;
        const completed: CompletedSet = { ...set, completedAt: Date.now() };
        const updatedTarget = { ...target, sets: [...target.sets, completed] };
        return { ...current, exercises: Object.assign([...exercises], { [idx]: updatedTarget }) };
    });
}
```