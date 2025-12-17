# Refined Git Workflow: Working from feature/a11y-improvements

## Current Situation

- Already on branch: `feature/a11y-improvements`
- Branch exists on remote: `origin/feature/a11y-improvements`
- All test and component work is currently uncommitted

## Strategy Options

### Option A: Commit Everything to Current Branch (Simplest)
**Pros**: 
- Single PR to review
- All work stays together
- Fast to execute

**Cons**:
- Large PR (harder to review)
- Mixes infrastructure, tests, and component changes
- If one part needs changes, whole PR is blocked

### Option B: Multiple Commits on Current Branch (Recommended)
**Pros**:
- Logical commit history
- Each commit is focused and reviewable
- Single PR but easy to understand progression
- Can use `git rebase -i` to reorganize if needed

**Cons**:
- Still one PR to review (but structured)

### Option C: Create Sub-branches from Current Branch
**Pros**:
- Multiple smaller PRs
- Each PR targets feature/a11y-improvements
- After all merged, one final PR to main

**Cons**:
- More complex workflow
- Dependencies between PRs

## Recommended Approach: Option B

Create a series of focused commits on `feature/a11y-improvements`, then create ONE comprehensive PR to main.

## Commit Sequence

### Commit 1: Test Infrastructure
```bash
git add tests/setup.ts vitest.config.ts package.json package-lock.json
git commit -m "test: enhance infrastructure for async data loading

- Fix fetch mock to return { data: <value> } structure matching API
- Exclude Playwright E2E tests (*.spec.ts) from Vitest runs
- Add @testing-library/user-event for interaction testing
- Configure proper test excludes

This infrastructure is required for usePersistentState to work in tests."
```

### Commit 2: Accessibility Test Suite
```bash
git add tests/components/PlanEditor.a11y.test.tsx \
        tests/components/WorkoutView.a11y.test.tsx \
        tests/components/ProgressView.a11y.test.tsx \
        tests/components/SkipToContent.a11y.test.tsx \
        tests/components/LibraryView.a11y.test.tsx \
        tests/components/LoginView.a11y.test.tsx \
        tests/components/PlansView.a11y.test.tsx

git commit -m "test: add comprehensive accessibility test suite (58 tests)

Add WCAG 2.1 Level A compliance tests for all major components:

- PlanEditor (11 tests): Form labels, keyboard nav, button states
- WorkoutView (12 tests): Heading hierarchy, progress, form inputs
- ProgressView (13 tests): Stat cards, semantic structure
- SkipToContent (11 tests): Focus management, skip link
- LibraryView (4 tests): Tabs accessibility, live regions
- LoginView (4 tests): Form accessibility, autocomplete
- PlansView (3 tests): Button labels, headings

Uses jest-axe for automated violation detection and validates
proper semantic HTML structure for screen reader compatibility."
```

### Commit 3: Behavioral and E2E Tests
```bash
git add tests/components/LibraryView.test.tsx \
        tests/components/AccountView.test.tsx \
        tests/components/LoginView.test.tsx \
        tests/workout-flow.spec.ts

git commit -m "test: add behavioral tests and E2E workout flow

LibraryView.test.tsx (15 tests):
- Search/filter functionality, case-insensitive search
- Combined filters, empty states, live regions

Updated existing tests with better async handling:
- AccountView.test.tsx: Use findBy for async data
- LoginView.test.tsx: Proper async waits

E2E tests (workout-flow.spec.ts - 3 scenarios):
- Complete workout creation to completion flow
- Exercise navigation during workout
- Set completion validation

Uses Playwright for real browser automation."
```

### Commit 4: New Accessibility Components
```bash
git add src/components/SkipToContent.tsx \
        src/hooks/use-announcer.ts

git commit -m "feat: add accessibility components for screen readers

SkipToContent component:
- Keyboard skip-to-content link
- Visible on focus, smooth scrolling
- Proper ARIA semantics

useAnnouncer hook:
- Global ARIA live region for announcements
- Polite/assertive priority support
- Auto-cleanup on unmount

Improves keyboard navigation and screen reader feedback."
```

### Commit 5: WorkoutView Accessibility Fixes
```bash
git add src/components/WorkoutView.tsx

git commit -m "fix: improve WorkoutView form accessibility

Address axe-core violations in SetTracker component:

Changes:
- Import Label component from ui/label
- Replace lowercase <label> with proper <Label> components
- Add id/htmlFor associations for reps input
- Add id/htmlFor associations for weight input

Fixes:
- 'Form elements must have labels' (critical)
- Ensures keyboard and screen reader users can interact properly

Test coverage: WorkoutView.a11y.test.tsx"
```

### Commit 6: LibraryView Accessibility Fixes
```bash
git add src/components/LibraryView.tsx

git commit -m "fix: improve LibraryView accessibility and structure

Address multiple axe-core violations:

1. Heading hierarchy:
   - Add sr-only <h2> for proper h1→h2→h3 flow
   - Fix exercise card heading levels

2. Tabs accessibility:
   - Add aria-label to TabsList
   - Add hidden TabsContent for ARIA relationships

Fixes:
- 'Tabs must have corresponding content' (serious)
- 'Headings must increase by one level' (moderate)

Test coverage: LibraryView.a11y.test.tsx"
```

### Commit 7: Component Integration and Cleanup
```bash
git add src/App.tsx \
        src/components/PlansView.tsx \
        src/components/ProgressView.tsx \
        src/components/AccountView.tsx \
        src/components/LoginView.tsx \
        src/components/SignupView.tsx

git rm src/components/PlansView.test.tsx

git commit -m "fix: integrate accessibility improvements across app

App.tsx:
- Add SkipToContent for keyboard navigation

PlansView/ProgressView:
- Add ARIA labels to icon-only buttons
- Improve semantic structure

AccountView/LoginView/SignupView:
- Add autocomplete attributes
- Ensure proper form labels
- Fix async state loading for tests

Cleanup:
- Remove PlansView.test.tsx (E2E moved to workout-flow.spec.ts)"
```

### Commit 8: Documentation
```bash
git add TEST_IMPLEMENTATION_A11Y_SUMMARY.md

git commit -m "docs: add test implementation summary and results

Comprehensive documentation of test suite implementation:

- Test coverage: 104 tests, 100% passing
- Infrastructure improvements made
- Component accessibility issues fixed
- Async data loading fixes
- Lessons learned about testability

Serves as reference for maintaining accessibility standards
and understanding test architecture."
```

### Commit 9: Workflow Documentation
```bash
git add GIT_WORKFLOW_PLAN.md REFINED_WORKFLOW.md

git commit -m "docs: add git workflow planning documentation

Document the branching strategy and commit organization
for this comprehensive test and accessibility improvement work."
```

## Execution Commands

```bash
# Make sure we're on the right branch
git checkout feature/a11y-improvements

# Execute commits 1-9 as shown above

# Push all commits to remote
git push origin feature/a11y-improvements

# Create PR to main
gh pr create --base main \
  --title "feat: comprehensive accessibility improvements and test suite" \
  --body "$(cat <<EOF
# Comprehensive Accessibility Improvements and Test Suite

## Summary
This PR adds comprehensive accessibility testing, fixes identified issues, and achieves 100% test pass rate with 104 tests.

## What's Changed

### Test Infrastructure (Commit 1)
- Enhanced fetch mock for proper API response structure
- Configured Vitest to exclude Playwright E2E tests
- Added user-event library for better interaction testing

### Test Suite (Commits 2-3)
- **58 new accessibility tests** across 7 components using jest-axe
- **15 behavioral tests** for LibraryView interactions
- **3 E2E test scenarios** with Playwright for complete workout flow
- Updated existing tests with better async handling

### New Components (Commit 4)
- SkipToContent: Keyboard navigation skip link
- useAnnouncer hook: ARIA live region support

### Accessibility Fixes (Commits 5-7)
- **WorkoutView**: Form label improvements for set tracking
- **LibraryView**: Tabs ARIA compliance and heading hierarchy
- **Multiple components**: Integration of accessibility improvements

### Documentation (Commits 8-9)
- Complete test implementation summary
- Git workflow documentation

## Test Results
✅ All 104 tests passing (100% pass rate)
✅ Zero accessibility violations detected by axe-core
✅ WCAG 2.1 Level A compliance achieved
✅ E2E workflow validated with Playwright

## Breaking Changes
None

## Migration Guide
No migration needed. All changes are backwards compatible.

## Review Focus
1. Test coverage and quality
2. Component accessibility improvements
3. Keyboard and screen reader compatibility
4. Documentation completeness

## Testing Instructions
\`\`\`bash
npm test              # Run unit tests
npm run test:e2e     # Run E2E tests (requires dev server)
npm run lint         # Linting
npm run build        # Production build
\`\`\`

### Manual Testing
- Test with keyboard only (Tab, Enter, Escape)
- Test with screen reader (VoiceOver/NVDA)
- Test with 200% browser zoom
- Test with high contrast mode

## Screenshots
[Add screenshots of test results if available]

## Related Issues
Closes #[issue-number]

## Checklist
- [x] Tests added/updated
- [x] Documentation updated
- [x] No breaking changes
- [x] Accessibility verified
- [x] All tests passing
EOF
)"
```

## After PR is Approved and Merged

```bash
# Switch to main and pull
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/a11y-improvements

# Delete remote feature branch (optional)
git push origin --delete feature/a11y-improvements
```

## If Changes Requested During Review

```bash
# Make changes
# Stage and commit with descriptive message
git add <files>
git commit -m "fix: address PR feedback - <specific change>"

# Push to update PR
git push origin feature/a11y-improvements
```

## Interactive Rebase (if needed to reorganize commits)

```bash
# Start interactive rebase
git rebase -i HEAD~9  # 9 commits back

# In editor, you can:
# - Reorder commits (cut and paste lines)
# - Squash commits (change 'pick' to 'squash')
# - Edit commit messages (change 'pick' to 'reword')
# - Drop commits (change 'pick' to 'drop')

# After editing, save and close
# Git will apply changes

# Force push if already pushed (use with caution)
git push origin feature/a11y-improvements --force-with-lease
```

## Advantages of This Approach

1. **Clear History**: Each commit is focused and tells a story
2. **Easy Bisect**: If issues arise, git bisect can pinpoint the commit
3. **Partial Revert**: Can revert specific commits if needed
4. **Review Friendly**: Reviewers can review commit-by-commit
5. **Documentation**: Commit messages serve as implementation log
6. **Clean Main**: After merge, main has a clean, logical history

## View Commit History

```bash
# View commits with stats
git log --oneline --stat

# View commits with diffs
git log -p

# View graphical history
git log --oneline --graph --decorate --all
```
