# GitHub Actions Quick Start Guide

## Initial Setup

Follow these steps to activate the CI/CD workflows for your repository.

### 1. Update Repository URL

Edit [package.json](../package.json) and replace the repository URL:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_USERNAME/workout-tracker-demo.git"
}
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure GitHub Secrets

Go to your repository on GitHub:
1. Navigate to `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add the following secrets:

#### Required Secret: JWT_SECRET

```bash
# Generate a secure secret
openssl rand -base64 32
```

Create secret:
- **Name:** `JWT_SECRET`
- **Value:** [paste the generated string]

#### Optional Secret: CODECOV_TOKEN

If you want code coverage tracking:
1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the token from the Codecov dashboard
4. Create secret:
   - **Name:** `CODECOV_TOKEN`
   - **Value:** [paste Codecov token]

### 3. Install Dependencies

The workflows require new dependencies. Install them:

```bash
npm install
```

This will install:
- `semantic-release` and plugins
- `wait-on` for E2E tests
- Other development dependencies

### 4. Configure Branch Protection (Recommended)

Enforce quality checks before merging:

1. Go to `Settings` → `Branches`
2. Click `Add branch protection rule`
3. Configure:
   - **Branch name pattern:** `main`
   - ✅ Require a pull request before merging
     - Required approvals: 1
   - ✅ Require status checks to pass before merging
     - Search and add these checks:
       - `Lint (22)`
       - `Lint (24)`
       - `Unit Tests & Coverage (22)`
       - `Unit Tests & Coverage (24)`
       - `Build (22)`
       - `Build (24)`
     - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
4. Click `Create` or `Save changes`

### 5. Commit and Push

Commit the new workflow files:

```bash
git add .github/ .releaserc.json .env.example package.json package-lock.json
git commit -m "ci: add GitHub Actions workflows for CI/CD

- Add CI workflow for linting, testing, and building
- Add release workflow with semantic-release
- Configure code coverage reporting
- Add branch protection documentation"
git push origin main
```

### 6. Create Your First PR

Test the workflows:

```bash
# Create a feature branch
git checkout -b feature/test-workflows

# Make a small change
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: verify CI workflows"

# Push and create PR
git push origin feature/test-workflows
```

Then create a pull request on GitHub. You should see the CI checks run automatically!

## Using Conventional Commits

For semantic-release to work properly, use conventional commit format:

### Common Commit Types

```bash
# New feature (bumps minor version: 0.1.0 → 0.2.0)
git commit -m "feat: add workout timer feature"
git commit -m "feat(progress): add monthly statistics chart"

# Bug fix (bumps patch version: 0.1.0 → 0.1.1)
git commit -m "fix: correct set counter reset issue"
git commit -m "fix(auth): handle expired token gracefully"

# Performance improvement (bumps patch version)
git commit -m "perf: optimize chart rendering"

# Code refactoring (bumps patch version)
git commit -m "refactor: simplify API service layer"

# Breaking change (bumps major version: 0.1.0 → 1.0.0)
git commit -m "feat!: redesign workout API"
# OR with explanation
git commit -m "feat: redesign workout API

BREAKING CHANGE: Session data structure changed from array to object"

# No version bump (documentation, tests, chores)
git commit -m "docs: update README with new features"
git commit -m "test: add PlanEditor component tests"
git commit -m "chore: update dependencies"
git commit -m "ci: update Node version matrix"
```

### Commit Message Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

- **type:** feat, fix, docs, style, refactor, perf, test, build, ci, chore
- **scope:** Optional component/module name (plans, workout, auth, etc.)
- **subject:** Brief description (imperative mood: "add" not "added")
- **body:** Detailed explanation (optional)
- **footer:** Breaking changes or issue references (optional)

## Verifying Workflows

### Check Workflow Status

After pushing to your PR branch:
1. Go to the PR on GitHub
2. Scroll down to "Checks"
3. You should see: Lint, Unit Tests & Coverage, Build, E2E Tests (optional)
4. Click "Details" on any check to view logs

### View All Workflow Runs

Go to the `Actions` tab in your repository to see all workflow runs.

### Test Locally Before Pushing

Run the same checks locally:

```bash
# Lint
npm run lint

# Unit tests
npm test -- --run

# Coverage
npm run test:coverage

# Build
npm run build

# E2E (requires servers running in separate terminals)
# Terminal 1:
npm run backend

# Terminal 2:
npm run dev:frontend

# Terminal 3:
npx playwright install --with-deps
npm run test:e2e
```

## Triggering a Release

Releases are triggered automatically when you merge a PR to `main` with conventional commits:

1. Create a PR with commits like `feat: add new feature` or `fix: bug fix`
2. Get PR approved and merge to `main`
3. The Release workflow will:
   - Analyze commits
   - Determine version bump
   - Create a GitHub Release
   - Generate CHANGELOG.md
   - Upload deployment package

### First Release

The first time semantic-release runs, it will create version `1.0.0` if you have a `feat:` commit, or `0.1.0` otherwise.

### Manual Release (if needed)

```bash
# Create empty commit with conventional format
git commit --allow-empty -m "feat: initial release"
git push origin main
```

## Troubleshooting

### Workflows Don't Appear

- Ensure `.github/workflows/` directory is committed
- Check that workflow files are named `ci.yml` and `release.yml`
- Verify YAML syntax (no indentation errors)

### CI Checks Fail

1. **Lint fails:** Run `npm run lint` locally and fix issues
2. **Tests fail:** Run `npm test -- --run` locally and check errors
3. **Build fails:** Run `npm run build` locally and resolve build errors
4. **E2E fails:** This won't block your PR (set to `continue-on-error`)

### No Release Created

- Check that commits follow conventional commit format
- Verify at least one `feat:` or `fix:` commit exists
- Review Release workflow logs in Actions tab
- Ensure `GITHUB_TOKEN` has write permissions (automatic)

### Coverage Upload Fails

- This won't block your PR (`fail_ci_if_error: false`)
- Check that `CODECOV_TOKEN` is set correctly
- Visit Codecov dashboard to verify repository connection

## Next Steps

1. ✅ Set up workflows (you're here!)
2. 📝 Update README badges (see [WORKFLOWS.md](WORKFLOWS.md#workflow-badges))
3. 🔒 Configure branch protection rules
4. 👥 Add collaborators and reviewers
5. 🚀 Start creating features with conventional commits!

## Resources

- [Full Workflow Documentation](WORKFLOWS.md)
- [Conventional Commits Guide](https://www.conventionalcommits.org/)
- [Semantic Release Docs](https://semantic-release.gitbook.io/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
