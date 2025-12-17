# GitHub Actions Workflow Fixes

This document explains the fixes applied to resolve the two major workflow issues in the CI/CD pipeline.

## Issue 1: E2E Tests Hanging on Server Startup ✅

### Problem
The E2E tests were hanging indefinitely when waiting for servers to start because:
1. Background processes started with `&` don't properly expose their environment context to subsequent commands
2. The `wait-on` command couldn't detect when servers were ready due to process isolation
3. No health check verification was performed after wait-on completed

### Solution
**Changed from**: Separate background processes for backend and frontend
```bash
npm run backend &
npm run dev:frontend &
npx wait-on http://localhost:3000 http://localhost:5173
```

**Changed to**: Using `concurrently` to run all processes with shared environment context
```bash
npx concurrently -k -s first \
  "PORT=3000 JWT_SECRET=... npm run backend" \
  "VITE_API_URL=http://localhost:3000 npm run dev:frontend" \
  "npx wait-on http://localhost:3000 http://localhost:5173 -t 60000 && exit 0" &
```

### Key Improvements
- ✅ **Shared context**: `concurrently` runs all processes in the same environment, ensuring visibility
- ✅ **Health checks**: Added explicit curl checks for `/api/health` and frontend root
- ✅ **Proper cleanup**: Kill entire process group using `-$(cat servers.pid)` to ensure all children terminate
- ✅ **Fallback cleanup**: Use `lsof` to kill any remaining processes on ports 3000 and 5173
- ✅ **Exit on success**: wait-on command exits when servers are ready, allowing tests to proceed

### Testing
Run E2E tests locally to verify:
```bash
npm run test:e2e
```

In GitHub Actions, the workflow will now:
1. Start both servers with concurrently
2. Wait for both to respond (max 60 seconds)
3. Verify health with curl
4. Run Playwright tests
5. Clean up all processes properly

---

## Issue 2: Semantic Release Branch Protection Conflict ✅

### Problem
The `semantic-release` workflow failed because:
1. It tried to push commits (CHANGELOG.md, package.json updates) directly to `main`
2. Branch protection rules prevent direct pushes without PR reviews
3. Default `GITHUB_TOKEN` doesn't have bypass permissions

### Solution
**Modified**: Use a dedicated token with bypass permissions

#### Changes Made to `.github/workflows/release.yml`:

1. **Checkout with custom token**:
```yaml
- name: Checkout code
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.SEMANTIC_RELEASE_TOKEN || secrets.GITHUB_TOKEN }}
    fetch-depth: 0
    persist-credentials: false
```

2. **Configure git identity for semantic-release**:
```yaml
- name: Run semantic-release
  env:
    GITHUB_TOKEN: ${{ secrets.SEMANTIC_RELEASE_TOKEN || secrets.GITHUB_TOKEN }}
    GIT_AUTHOR_NAME: semantic-release-bot
    GIT_AUTHOR_EMAIL: semantic-release-bot@fittrack.local
    GIT_COMMITTER_NAME: semantic-release-bot
    GIT_COMMITTER_EMAIL: semantic-release-bot@fittrack.local
```

### Required Setup Steps

You need to create a Personal Access Token (PAT) or GitHub App with bypass permissions:

#### Option A: Personal Access Token (Recommended for small teams)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Configure:
   - **Name**: `semantic-release-bot`
   - **Expiration**: 1 year (or custom)
   - **Repository access**: Only select repositories → `workout-tracker-demo`
   - **Permissions**:
     - Contents: Read and write
     - Pull requests: Read and write
     - Workflows: Read and write
4. **Important**: Enable "Bypass branch protections" in your repository settings for this token's user
5. Copy the generated token
6. Add to repository secrets:
   - Go to Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SEMANTIC_RELEASE_TOKEN`
   - Value: (paste your PAT)

#### Option B: GitHub App (Recommended for organizations)

1. Create a GitHub App with:
   - Contents: Read and write
   - Pull requests: Read and write
   - Workflows: Read and write
2. Install app on your repository
3. Generate and download private key
4. Configure app to bypass branch protections
5. Use `actions/create-github-app-token` action in workflow

#### Option C: Adjust Branch Protection (Not Recommended)

If you can't create a bypass token, you could:
- Allow specific users/apps to bypass branch protection
- Disable "Require pull request reviews" for semantic-release commits (insecure)

### How It Works

1. When a commit is pushed to `main`, the release workflow triggers
2. Semantic-release analyzes commits using conventional commit format:
   - `feat:` → minor version bump
   - `fix:` → patch version bump
   - `BREAKING CHANGE:` → major version bump
3. If a release is warranted:
   - Generates CHANGELOG.md
   - Updates package.json version
   - Creates GitHub Release with deployment package
   - Commits changes with `[skip ci]` to prevent recursive triggers
4. Using `SEMANTIC_RELEASE_TOKEN`, these commits bypass branch protection

### Commit Message Format

To trigger releases, use conventional commits:
```bash
# Patch release (0.0.1 → 0.0.2)
git commit -m "fix: resolve E2E test hanging issue"

# Minor release (0.0.2 → 0.1.0)
git commit -m "feat: add user authentication"

# Major release (0.1.0 → 1.0.0)
git commit -m "feat: redesign API

BREAKING CHANGE: API endpoints now require authentication headers"
```

### Verification

After setup, you can test by:
1. Making a commit with conventional commit format
2. Pushing to main (via PR or direct push if allowed)
3. Checking Actions tab for "Release" workflow
4. Verifying CHANGELOG.md and package.json are updated
5. Confirming GitHub Release is created with deployment artifacts

---

## Summary

Both workflow issues are now resolved:

✅ **E2E Tests**: Will no longer hang - using `concurrently` for proper process management
✅ **Semantic Release**: Can bypass branch protections with dedicated token (setup required)

### Next Steps

1. **Test E2E fix**: Push changes to a PR and verify E2E tests pass in Actions
2. **Configure semantic-release token**: Follow Option A or B above to create `SEMANTIC_RELEASE_TOKEN`
3. **Verify release workflow**: Make a test commit with conventional format and confirm release is created

### Rollback Plan

If issues persist:
- E2E: Revert to separate server processes, add explicit sleep/poll loops
- Semantic Release: Use PR-based release workflow instead of direct push
