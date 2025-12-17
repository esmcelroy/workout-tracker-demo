# Workflow Status Badges

Add these badges to your [README.md](../../README.md) to display workflow status:

## GitHub Actions Badges

```markdown
## Build Status

![CI](https://github.com/YOUR_USERNAME/workout-tracker-demo/workflows/CI/badge.svg)
![Release](https://github.com/YOUR_USERNAME/workout-tracker-demo/workflows/Release/badge.svg)
```

**Replace `YOUR_USERNAME`** with your GitHub username.

## Code Coverage Badge (if using Codecov)

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/workout-tracker-demo/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/workout-tracker-demo)
```

## Alternative Badge Styles

### Shields.io Style

```markdown
[![CI Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/workout-tracker-demo/ci.yml?branch=main&label=CI&logo=github)](https://github.com/YOUR_USERNAME/workout-tracker-demo/actions/workflows/ci.yml)
[![Release Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/workout-tracker-demo/release.yml?branch=main&label=Release&logo=github)](https://github.com/YOUR_USERNAME/workout-tracker-demo/actions/workflows/release.yml)
[![Latest Release](https://img.shields.io/github/v/release/YOUR_USERNAME/workout-tracker-demo?logo=github)](https://github.com/YOUR_USERNAME/workout-tracker-demo/releases)
[![License](https://img.shields.io/github/license/YOUR_USERNAME/workout-tracker-demo)](LICENSE)
```

## Complete Example

```markdown
# FitTrack 💪

> Modern workout tracking application built with React 19 and TypeScript

![CI](https://github.com/YOUR_USERNAME/workout-tracker-demo/workflows/CI/badge.svg)
![Release](https://github.com/YOUR_USERNAME/workout-tracker-demo/workflows/Release/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/workout-tracker-demo/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/workout-tracker-demo)
[![Latest Release](https://img.shields.io/github/v/release/YOUR_USERNAME/workout-tracker-demo?logo=github)](https://github.com/YOUR_USERNAME/workout-tracker-demo/releases)

## Features

- 📋 Workout Plans
- 🏋️ Active Session Tracking
- 📊 Progress Analytics
- 📚 Exercise Library

[... rest of README ...]
```

## Badge Preview

Once you push the workflows and run them, badges will show:

- ✅ **passing** - All checks successful
- ❌ **failing** - One or more checks failed
- ⏳ **running** - Workflow in progress
- ⚫ **no status** - No workflow runs yet

## Updating Badges

Badges update automatically when:
- CI workflow completes (on PR or push)
- Release workflow completes (on merge to main)
- Coverage reports upload to Codecov

No manual updates needed!
