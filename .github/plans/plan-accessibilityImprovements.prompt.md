# Plan: Implement WCAG 2.1 AA Accessibility Compliance

This plan addresses accessibility gaps across FitTrack to achieve WCAG 2.1 AA compliance. The app has a solid foundation with Radix UI primitives but lacks ARIA labels, keyboard navigation, screen reader support, and automated testing. Work is prioritized by impact: critical WCAG violations → keyboard/focus management → enhanced screen reader support → automated testing integration.

## Steps

### 1. Install accessibility dependencies and configure automated testing

Add `axe-core`, `@axe-core/react`, `vitest-axe`, `@axe-core/playwright`, and React ARIA utilities (`@react-aria/visually-hidden`, `@react-aria/live-announcer`) to `package.json`. Integrate `vitest-axe` into existing test files and add axe scans to Playwright E2E tests.

### 2. Fix critical WCAG violations (P0) in all view components

Add `aria-label` to all icon-only buttons in `PlansView.tsx`, `WorkoutView.tsx`, `AccountView.tsx`. Add visible/associated labels to the search input in `LibraryView.tsx`. Fix heading hierarchy (add `<h1>` page titles) in `PlansView.tsx`, `WorkoutView.tsx`, `ProgressView.tsx`, `LibraryView.tsx`, `AccountView.tsx`. Add `<main>` landmark to `App.tsx` content area and `<nav role="navigation" aria-label="Main navigation">` to desktop tabs and mobile bottom nav. Add `autocomplete` attributes to `LoginView.tsx` and `SignupView.tsx` forms.

### 3. Implement keyboard navigation and focus management

Add keyboard shortcuts using `react-hotkeys-hook` (Cmd/Ctrl+K for search, arrow keys for exercise navigation in `WorkoutView.tsx`). Add focus management to `PlanEditor.tsx` dialog (focus first input on open, restore focus on close). Add `aria-current="page"` to active tabs in `App.tsx` and mobile navigation. Implement skip-to-content link in `App.tsx` header. Add keyboard handler to "Complete Set" button in `WorkoutView.tsx` to trigger on Enter.

### 4. Add ARIA live regions and screen reader announcements

Create `useAnnouncer` hook wrapping `@react-aria/live-announcer` for dynamic status updates. Add live regions to `WorkoutView.tsx` for set completion and exercise progression ("Set 2 of 4 completed", "Moved to exercise 3 of 5"). Add `aria-live="polite"` regions to `ProgressView.tsx` for workout history count and `LibraryView.tsx` for filtered exercise count. Verify Sonner toast `aria-live` configuration in `src/components/ui/sonner.tsx` and adjust timeout for screen reader users.

### 5. Improve semantic HTML and convert visual-only elements to accessible patterns

Convert plan/workout/exercise lists to semantic `<ul>/<ol>` structures in `PlansView.tsx`, `WorkoutView.tsx`, `ProgressView.tsx`, `LibraryView.tsx`. Wrap completed sets tracker in `WorkoutView.tsx` with proper ARIA progressbar or ordered list. Add `<article>` elements to workout history cards in `ProgressView.tsx`. Add `aria-describedby` to complex form inputs in `PlanEditor.tsx` linking to helper text. Add `aria-hidden="true"` to decorative icons in `AccountView.tsx`.

### 6. Test and verify color contrast, add reduced motion support, and document findings

Use WAVE/axe DevTools to audit color contrast ratios for `text-muted-foreground`, disabled states, and badge variants in `theme.css`. Wrap all Framer Motion animations in `useReducedMotion()` checks in `WorkoutView.tsx` and `PlansView.tsx`. Add pattern fills or textures to Recharts in `ProgressView.tsx` for color-blind users. Run manual screen reader tests (VoiceOver/NVDA) on critical flows (signup, create plan, complete workout). Document remaining issues and create PR with automated test coverage report.

## Further Considerations

### 1. Form validation announcement strategy

Should form errors in `LoginView.tsx`/`SignupView.tsx` automatically move focus to the first invalid field, or only announce errors via live region? Recommendation: Move focus for single-field errors, use live region for multi-field validation summaries. Should `PlanEditor.tsx` validate empty exercise list before allowing save?

### 2. Touch target size verification

Icon-only buttons currently use `size="icon"` (likely 18px-24px). WCAG 2.1 AA requires 44x44px touch targets. Should we increase button padding, add invisible hit areas, or only enforce on mobile breakpoints? Recommendation: Add `min-w-[44px] min-h-[44px]` to mobile breakpoints while keeping visual size compact.

### 3. Testing coverage scope

Full manual screen reader testing across VoiceOver (macOS/iOS), NVDA, and JAWS may take 3-5 days. Should we prioritize one screen reader and one critical flow for initial launch, or delay release for comprehensive testing? Recommendation: Test VoiceOver + NVDA on signup → create plan → complete workout flow, document known issues for JAWS as backlog item.
