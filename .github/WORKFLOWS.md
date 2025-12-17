# GitHub Actions Workflows

This document describes the GitHub Actions CI/CD workflows configured for the FitTrack application.

## Overview

Two workflows are configured:
1. **CI Workflow** (`.github/workflows/ci.yml`) - Runs quality checks on pull requests
2. **Release Workflow** (`.github/workflows/release.yml`) - Automates versioning and releases

## CI Workflow

**Triggers:** Pull requests and pushes to `main` or `master` branches

**Node.js Versions:** 22 and 24

### Jobs

#### 1. Lint
- Runs ESLint on all code
- Matrix: Node 22 and 24
- **Required for merge**

#### 2. Unit Tests & Coverage
- Runs Vitest unit tests with coverage reporting
- Uploads coverage to Codecov (Node 22 only)
- Matrix: Node 22 and 24
- **Required for merge**

#### 3. Build
- Builds the application with `npm run build`
- Uploads build artifacts (Node 22 only)
- Matrix: Node 22 and 24
- **Required for merge**

#### 4. E2E Tests (Optional)
- Runs Playwright E2E tests
- Only runs on Node 22 (to save resources)
- Uses `continue-on-error: true` - **does not block PR merges**
- Starts both backend and frontend servers
- Uploads test reports and videos on failure
- Requires `JWT_SECRET` (falls back to test value if not set)

### Caching Strategy

- **npm dependencies:** Cached via `actions/setup-node` with `cache: 'npm'`
- **Playwright browsers:** Cached in `~/.cache/ms-playwright` keyed by `package-lock.json` hash

### Environment Variables

The CI workflow uses these environment variables:
- `CI=true` - Enables CI mode for tools
- `PORT=3000` - Backend server port
- `VITE_API_URL=http://localhost:3000` - Frontend API URL
- `NODE_ENV=test` - Test environment mode
- `JWT_SECRET` - JWT signing secret (from GitHub secrets or test default)

## Release Workflow

**Triggers:** Pushes to `main` or `master` branches (after PR merge)

**Node.js Version:** 22

### Semantic Versioning

Uses [semantic-release](https://github.com/semantic-release/semantic-release) with conventional commits:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (0.x.0) | `feat: add workout timer` |
| `fix:` | Patch (0.0.x) | `fix: correct set counter` |
| `perf:` | Patch (0.0.x) | `perf: optimize chart rendering` |
| `refactor:` | Patch (0.0.x) | `refactor: simplify API calls` |
| `build:` | Patch (0.0.x) | `build: update dependencies` |
| `BREAKING CHANGE:` | Major (x.0.0) | `feat!: remove legacy API` |
| `docs:`, `test:`, `ci:`, `chore:` | No release | `docs: update README` |

### Release Process

1. **Build Application** - Runs `npm run build` to create production assets
2. **Prepare Deployment Package:**
   - `dist/` - Built frontend
   - `server.ts` - Backend server
   - `package.json` & `package-lock.json` - Dependencies
   - `node_modules/` - Production dependencies
   - `.env.template` - Environment variables template
   - `DEPLOYMENT.md` - Deployment instructions
3. **Create Archive** - Creates `fittrack-release-{sha}.tar.gz`
4. **Run Semantic Release:**
   - Analyzes commits since last release
   - Determines next version number
   - Generates release notes from conventional commits
   - Updates `CHANGELOG.md`
   - Creates Git tag and GitHub Release
   - Uploads deployment package as release asset
   - Comments on included PRs/issues
5. **Upload Artifact** - Stores deployment package for 90 days

### Release Notes Format

Release notes are automatically generated with sections:
- ✨ Features
- 🐛 Bug Fixes
- ⚡ Performance Improvements
- ♻️ Code Refactoring
- 📦 Build System
- 📚 Documentation

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### Required Secrets

| Secret | Purpose | How to Generate |
|--------|---------|-----------------|
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions | No action needed - automatically available |
| `JWT_SECRET` | JWT token signing for E2E tests | Generate: `openssl rand -base64 32` |

### Optional Secrets

| Secret | Purpose | How to Generate |
|--------|---------|-----------------|
| `CODECOV_TOKEN` | Upload coverage to Codecov | Sign up at [codecov.io](https://codecov.io), get token from dashboard |
| `NPM_TOKEN` | Publish to npm (if enabling npm publish) | Create at [npmjs.com](https://www.npmjs.com/settings/~/tokens) |

## Branch Protection Rules

To enforce quality checks before merging, configure branch protection rules:

1. Go to **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main` (or `master`)
3. Enable:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1 (recommended)
   - ✅ **Require status checks to pass before merging**
     - Required checks:
       - `Lint (22)`
       - `Lint (24)`
       - `Unit Tests & Coverage (22)`
       - `Unit Tests & Coverage (24)`
       - `Build (22)`
       - `Build (24)`
     - ✅ Require branches to be up to date before merging
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**

**Note:** Do NOT require the E2E test job as it uses `continue-on-error: true`.

## Conventional Commits

To ensure semantic-release works correctly, use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Examples

```bash
# Feature (minor version bump)
git commit -m "feat: add exercise difficulty filter"
git commit -m "feat(plans): add workout plan templates"

# Bug fix (patch version bump)
git commit -m "fix: correct set completion animation"
git commit -m "fix(auth): prevent token expiration error"

# Breaking change (major version bump)
git commit -m "feat!: redesign workout session API"
# OR
git commit -m "feat: redesign API

BREAKING CHANGE: Workout sessions now use different data structure"

# No release
git commit -m "docs: update installation instructions"
git commit -m "test: add LibraryView tests"
git commit -m "ci: update Node version matrix"
git commit -m "chore: update dependencies"
```

## Manual Release Trigger

To manually trigger a release (without merging a PR):

```bash
# Create an empty commit with appropriate type
git commit --allow-empty -m "chore(release): trigger release"
git push origin main
```

## Skipping CI

To skip CI on a commit (e.g., documentation updates):

```bash
git commit -m "docs: update README [skip ci]"
```

## Testing Workflows Locally

### Test CI Workflow

```bash
# Install dependencies
npm ci

# Run all checks in sequence
npm run lint
npm test -- --run
npm run test:coverage
npm run build

# Start servers for E2E (in separate terminals)
npm run backend
npm run dev:frontend

# Run E2E tests
npx playwright install --with-deps
npm run test:e2e
```

### Test Release Package Creation

```bash
# Build application
npm run build

# Create deployment package
mkdir -p release-package
cp -r dist release-package/
cp server.ts package.json package-lock.json release-package/
tar -czf fittrack-release-test.tar.gz -C release-package .
```

## Troubleshooting

### E2E Tests Fail in CI

1. Check that servers started correctly in workflow logs
2. Verify `JWT_SECRET` is set in GitHub secrets
3. Check Playwright browser installation
4. Review uploaded test artifacts for details

### Semantic Release Not Creating Release

1. Verify commits follow conventional commit format
2. Check that `GITHUB_TOKEN` has write permissions
3. Ensure at least one commit with `feat:`, `fix:`, etc. exists since last release
4. Review release workflow logs for errors

### Coverage Upload Fails

1. Verify `CODECOV_TOKEN` is set correctly
2. Check that coverage files are generated in `coverage/` directory
3. Ensure `fail_ci_if_error: false` is set (non-blocking)

### Build Artifacts Missing

1. Check that build step completed successfully
2. Verify `dist/` directory exists after build
3. Ensure Node version 22 is being used (artifacts only uploaded from Node 22)

## Workflow Badges

Add these badges to your `README.md`:

```markdown
![CI](https://github.com/YOUR_USERNAME/workout-tracker-demo/workflows/CI/badge.svg)
![Release](https://github.com/YOUR_USERNAME/workout-tracker-demo/workflows/Release/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/workout-tracker-demo/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/workout-tracker-demo)
```

## Maintenance

### Update Node.js Versions

Edit the `matrix.node-version` arrays in both workflow files:

```yaml
strategy:
  matrix:
    node-version: [22, 24]  # Update to newer versions as needed
```

### Update Playwright

```bash
npm install -D @playwright/test@latest
npx playwright install --with-deps
```

### Update Semantic Release

```bash
npm install -D semantic-release@latest @semantic-release/{changelog,commit-analyzer,git,github,npm,release-notes-generator}@latest
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
