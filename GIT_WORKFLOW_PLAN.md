# Git Workflow Plan: Test Suite & Accessibility Improvements

## Overview
This document outlines the branching and commit strategy for organizing all test suite and component accessibility improvements into logical, reviewable pull requests.

## Branches Overview

### 1. `test/infrastructure` (Base: main)
**Purpose**: Foundation for all test work - infrastructure improvements needed for tests to run properly.

**Files**:
- `tests/setup.ts` - Enhanced fetch mock with proper API response structure
- `vitest.config.ts` - Exclude Playwright E2E tests from Vitest
- `package.json` - Added @testing-library/user-event dependency
- `package-lock.json` - Lock file updates

**Commit Message**:
```
test: enhance test infrastructure for async data loading

- Fix fetch mock to return proper API response structure ({ data: <value> })
- Exclude Playwright E2E tests (*.spec.ts) from Vitest runs
- Add @testing-library/user-event for better interaction testing
- Configure vitest with proper excludes for E2E tests

This infrastructure is required for components using usePersistentState
to properly load async data in tests.
```

**Why separate**: This is the foundation. Other branches depend on these fixes.

---

### 2. `test/accessibility-suite` (Base: test/infrastructure or main after merge)
**Purpose**: Comprehensive accessibility test coverage for all major components.

#### Commit 1: Accessibility test files
**Files**:
- `tests/components/PlanEditor.a11y.test.tsx` (11 tests)
- `tests/components/WorkoutView.a11y.test.tsx` (12 tests)
- `tests/components/ProgressView.a11y.test.tsx` (13 tests)
- `tests/components/SkipToContent.a11y.test.tsx` (11 tests)
- `tests/components/LibraryView.a11y.test.tsx` (4 tests)
- `tests/components/LoginView.a11y.test.tsx` (4 tests)
- `tests/components/PlansView.a11y.test.tsx` (3 tests)

**Commit Message**:
```
test: add comprehensive accessibility test suite

Add accessibility tests for all major components covering:
- WCAG 2.1 Level A compliance using jest-axe
- Heading hierarchy validation
- Form label associations
- ARIA attribute correctness
- Keyboard navigation support
- Screen reader compatibility

Files created:
- PlanEditor (11 tests): Form labels, button states, keyboard nav
- WorkoutView (12 tests): Heading hierarchy, progress indicators, form inputs
- ProgressView (13 tests): Stat cards, workout history, semantic structure
- SkipToContent (11 tests): Focus management, skip link functionality
- LibraryView (4 tests): Tabs accessibility, search input, live regions
- LoginView (4 tests): Form accessibility, autocomplete attributes
- PlansView (3 tests): Button labels, heading hierarchy

All tests use axe-core for automated violation detection and
verify proper semantic HTML structure.
```

#### Commit 2: Behavioral and E2E test files
**Files**:
- `tests/components/LibraryView.test.tsx` (15 behavioral tests)
- `tests/components/AccountView.test.tsx` (updated with async improvements)
- `tests/components/LoginView.test.tsx` (updated with async improvements)
- `tests/workout-flow.spec.ts` (3 E2E scenarios)

**Commit Message**:
```
test: add behavioral tests and E2E workout flow

Add comprehensive behavioral testing:

LibraryView.test.tsx (15 tests):
- Search and filter functionality
- Case-insensitive search
- Combined filter scenarios
- Empty state handling
- Exercise details expansion
- Live region updates

Updated existing tests:
- AccountView.test.tsx: Better async handling with findBy queries
- LoginView.test.tsx: Proper wait for async state changes

E2E tests (workout-flow.spec.ts):
- Complete workout flow from creation to completion
- Navigation between exercises
- Set completion validation
- Progress history verification

Uses Playwright for real browser automation and validates
the entire user journey through the application.
```

**Why separate**: This is a focused PR on test coverage. Reviewers can verify test quality without component changes.

---

### 3. `fix/component-accessibility` (Base: main)
**Purpose**: Fix actual accessibility issues discovered by tests.

#### Commit 1: New accessibility components
**Files**:
- `src/components/SkipToContent.tsx` - Keyboard skip-to-content link
- `src/hooks/use-announcer.ts` - ARIA live region hook for screen readers

**Commit Message**:
```
feat: add accessibility components for screen reader support

Add SkipToContent component:
- Provides keyboard users quick access to main content
- Visible on focus, hidden otherwise
- Smooth scrolling behavior
- Proper ARIA semantics

Add useAnnouncer hook:
- Creates global ARIA live region for announcements
- Supports polite and assertive priorities
- Screen reader compatible updates for dynamic content
- Auto-cleanup on unmount

These components improve keyboard navigation and provide better
feedback for screen reader users.
```

#### Commit 2: WorkoutView accessibility fixes
**Files**:
- `src/components/WorkoutView.tsx`

**Commit Message**:
```
fix: improve WorkoutView form accessibility

Address accessibility violations found in testing:

SetTracker component improvements:
- Replace lowercase labels with proper <Label> components
- Add id/htmlFor associations for reps input
- Add id/htmlFor associations for weight input
- Ensure all form inputs have accessible names

Changes at lines:
- L5-8: Import Label component from ui/label
- L327-343: Replace <label> with <Label> and add proper associations

This fixes axe-core violations:
- "Form elements must have labels" (critical)
- Ensures keyboard and screen reader users can properly interact
  with set tracking inputs

Test coverage: WorkoutView.a11y.test.tsx
```

#### Commit 3: LibraryView accessibility fixes
**Files**:
- `src/components/LibraryView.tsx`

**Commit Message**:
```
fix: improve LibraryView accessibility and heading hierarchy

Address multiple accessibility issues:

1. Heading hierarchy:
   - Add sr-only <h2> element for proper h1→h2→h3 flow
   - Change exercise card headings from h3 to proper semantic levels
   - Ensure Radix Accordion h3 headings have proper parent h2

2. Tabs accessibility:
   - Add aria-label="Filter exercises by muscle group" to TabsList
   - Add hidden TabsContent elements for proper ARIA relationships
   - Ensures each TabsTrigger has corresponding TabsContent

Changes at lines:
- L27: Add sr-only h2 "Filter Exercises"
- L48-56: Add aria-label and hidden TabsContent elements
- L73-88: Fix heading hierarchy in accordion structure

This fixes axe-core violations:
- "Tabs must have corresponding content" (serious)
- "Headings must increase by one level" (moderate)

Test coverage: LibraryView.a11y.test.tsx
```

#### Commit 4: Other component improvements
**Files**:
- `src/App.tsx` - SkipToContent integration
- `src/components/PlansView.tsx` - Minor a11y improvements
- `src/components/ProgressView.tsx` - ARIA improvements
- `src/components/AccountView.tsx` - Test integration fixes
- `src/components/LoginView.tsx` - Autocomplete attributes
- `src/components/SignupView.tsx` - Form accessibility
- Delete `src/components/PlansView.test.tsx` - Was misplaced E2E file

**Commit Message**:
```
fix: integrate accessibility improvements across components

Multiple component enhancements:

App.tsx:
- Add SkipToContent component for keyboard navigation

PlansView.tsx:
- Add proper aria-labels to icon-only buttons
- Improve empty state messaging

ProgressView.tsx:
- Add proper ARIA labels to stat cards
- Improve semantic structure for workout history

AccountView.tsx/LoginView.tsx/SignupView.tsx:
- Add autocomplete attributes for better form UX
- Ensure all form inputs have proper labels
- Fix async state loading for test compatibility

Cleanup:
- Remove PlansView.test.tsx (was Playwright E2E, moved to workout-flow.spec.ts)

These changes improve overall accessibility across the app
and ensure components work properly with async testing.
```

**Why separate**: Component fixes are distinct from test coverage. This branch can be reviewed for UX/accessibility impact.

---

### 4. `docs/test-summary` (Base: main)
**Purpose**: Document the test implementation work.

**Files**:
- `TEST_IMPLEMENTATION_A11Y_SUMMARY.md`

**Commit Message**:
```
docs: add comprehensive test implementation summary

Add detailed documentation of test suite implementation:

- Test coverage statistics (104 tests, 100% passing)
- List of all test files created
- Infrastructure improvements made
- Component accessibility issues fixed
- Key fixes for async data loading
- Lessons learned about testability

This document serves as a reference for:
- Understanding the test architecture
- Debugging test failures
- Adding new tests
- Maintaining accessibility standards

Total test coverage:
- 58 new accessibility tests across 7 components
- 15 behavioral tests for LibraryView
- 3 E2E test scenarios for complete workflow
- Updated 2 existing test files with better async handling
```

**Why separate**: Documentation-only change, safe to review independently.

---

## Execution Order

1. **First**: Create and merge `test/infrastructure`
   - This is the foundation for everything else
   - Should be merged to main ASAP

2. **Second**: Create and merge `test/accessibility-suite`
   - Depends on infrastructure being in main
   - Can be reviewed in parallel with component fixes

3. **Third**: Create and merge `fix/component-accessibility`
   - Independent of test suite (but tests prove these fixes work)
   - Can be reviewed by UX/accessibility team

4. **Fourth**: Create and merge `docs/test-summary`
   - Final documentation after all work is complete

## PR Review Guidance

### test/infrastructure PR
**Reviewers**: Backend/test engineers
**Focus**: 
- Verify fetch mock matches backend API contract
- Check vitest config excludes are correct
- Confirm dependencies are appropriate versions

### test/accessibility-suite PR
**Reviewers**: QA, accessibility experts, test engineers
**Focus**:
- Verify test coverage is comprehensive
- Check axe-core is properly configured
- Ensure tests are maintainable and clear
- Validate E2E scenarios cover critical paths

### fix/component-accessibility PR
**Reviewers**: Frontend, UX, accessibility experts
**Focus**:
- Verify fixes don't break existing functionality
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Validate keyboard navigation works
- Check visual design is preserved

### docs/test-summary PR
**Reviewers**: Tech lead, documentation maintainer
**Focus**:
- Ensure documentation is accurate
- Verify links and references work
- Check for clarity and completeness

## Testing Each Branch

### Before creating PR:
```bash
# On each branch, run full test suite
npm test                    # Unit tests
npm run test:e2e           # E2E tests (requires dev server)
npm run lint               # Linting
npm run build              # Production build
```

### Manual accessibility testing:
- Test with keyboard only (Tab, Enter, Escape)
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- Test with browser zoom at 200%
- Test with high contrast mode

## Branch Cleanup After Merge

After each branch is merged to main:
```bash
git checkout main
git pull origin main
git branch -d <branch-name>
git push origin --delete <branch-name>
```

## Rollback Plan

If issues are found after merge:
1. Create hotfix branch from main
2. Fix the specific issue
3. Add test to prevent regression
4. Fast-track PR review
5. Deploy ASAP

## Success Metrics

- ✅ All 104 tests passing
- ✅ Zero accessibility violations in axe-core
- ✅ Clean PRs with focused changes
- ✅ Clear commit messages with context
- ✅ Comprehensive documentation
- ✅ Reviewers can easily understand impact
- ✅ No merge conflicts between branches
- ✅ Continuous integration passes on all branches

---

## Quick Command Reference

```bash
# Create branch from main
git checkout main
git pull origin main
git checkout -b <branch-name>

# Stage and commit
git add <files>
git commit -m "message"

# Push branch
git push -u origin <branch-name>

# Create PR
gh pr create --base main --head <branch-name> --title "Title" --body "Description"

# After PR merged
git checkout main
git pull origin main
git branch -d <branch-name>
```
