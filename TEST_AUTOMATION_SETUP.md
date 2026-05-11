# Daily Cadence Frontend - Local Test Automation Setup

## Overview

This project uses **Jest** for local automated unit testing and **CodeRabbit** for automated code reviews and quality gate enforcement on pull requests.

---

## 📁 Project Structure

```
├── app.js                      # Core frontend logic (Daily Plan & Report state machine)
├── index.html                  # Frontend UI structure
├── styles.css                  # Frontend styles
├── __tests__/                  # Test files
│   └── math.test.js            # Unit tests for app.js functions
│   └── setup.js                # Jest DOM environment setup
├── .github/workflows/          # GitHub Actions automation
│   └── frontend-test-generation.yml  # CI/CD pipeline for test creation
├── package.json                # NPM dependencies and scripts
├── jest.config.js              # Jest configuration
├── .babelrc                    # Babel transpiler config
├── .coderabbit.yaml            # CodeRabbit AI configuration
└── coderabbit.rules.json       # KPI rules and quality gates
```

---

## 🚀 Quick Start

### 1. Run Tests Locally

```bash
# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm test:watch

# Check test coverage
npm run test:coverage
```

### 2. Serve Frontend Locally

```bash
# Start HTTP server on http://localhost:8000
npm start

# Or use Python directly
npm run serve
```

---

## ✅ Test Suite (14 Tests)

### Time Formatting Tests
- ✓ Format minutes correctly (30m, 1h, 1h 30m)
- ✓ Handle edge cases (0m, 59m, 360m)

### Plan Management Tests
- ✓ Create a plan task with validation
- ✓ Reject invalid input (empty strings, null, numbers)
- ✓ Validate non-empty plans
- ✓ Calculate productivity percentage (0-100%)
- ✓ Cap productivity at 100%
- ✓ Handle division by zero
- ✓ Set priority flag on tasks

### UI State Management Tests
- ✓ Render greeting text element
- ✓ Have nav elements for navigation
- ✓ Have main content area

### Integration Tests
- ✓ Create multiple tasks and validate plan
- ✓ State workflow: empty → entry → filled → report

---

## 🔄 GitHub Actions Workflow

The workflow automates the test creation loop:

1. **Trigger**: Push to `dev` branch
2. **Detect Changes**: Identify modified files
3. **Import to Test Branch**: Create `test` branch with dev changes
4. **Create PR**: Open PR from `test` → `main`
5. **CodeRabbit Review**: AI reviews changes and suggests tests (via PR comments)
6. **Iterate**: Fix tests based on feedback
7. **Merge**: Approve and merge when tests pass

## 🤖 CodeRabbit Integration

Depending on your plan:

### Free Plan
- **Only**: PR summarization
- **Limited**: No code reviews or test generation

### Pro Plan ($24/dev/month)
- **Includes**: Code reviews, unit test generation, higher rate limits
- **Perfect for**: Automated test suggestions in PRs

### Pro+ Plan ($48/dev/month)
- **Includes**: Pro features + Tasks, plan generation, merge conflict resolution
- **Best for**: Full automation (pre/post-merge actions)

---

## 📋 Current Recommendation

For your setup, we recommend:

1. **Use Jest locally** (already set up) - No cost, full control
2. **Use CodeRabbit Free** - For PR summarization during review
3. **Upgrade to Pro** (optional) - If you want AI-powered test suggestions in PRs

OR

1. **Write tests manually** - Use our Jest setup as guide
2. **CodeRabbit for code reviews** - Pro plan gives automated reviews
3. **GitHub Actions** - Runs tests automatically on every push

---

## 🛑 Files Removed (Not Needed)

Cleaned up unnecessary files:
- ❌ `src/services/UserService.js` - Backend database code
- ❌ `src/utils/helpers.test.js` - Unrelated utility tests
- ❌ `src/utils/` directory - Backend-only utilities
- ❌ `package.json` (old) - Backend Node.js setup

---

## 📊 Test Commands

```bash
# Run tests once
npm test

# Run tests in watch mode (TDD style)
npm test:watch

# Show test coverage report
npm run test:coverage

# Start dev server
npm start
```

---

## 🔗 Next Steps

1. **Test locally**: `npm test` ✅ (14 tests passing)
2. **Preview UI**: `npm start` then open http://localhost:8000
3. **Commit changes**: `git add . && git commit -m "..."`
4. **Push to dev**: `git push origin dev`
5. **GitHub Actions runs**: Creates test branch & PR automatically
6. **CodeRabbit reviews**: Comments on PR with suggestions (Pro plan required)
7. **Approve & merge**: When tests pass

---

## 📝 Notes

- **Test files**: Located in `__tests__/` directory
- **Test runner**: Jest (no setup required after `npm install`)
- **Environment**: jsdom (simulates browser DOM)
- **Coverage**: Currently testing utility functions; app.js integration tests to follow
- **CI/CD**: GitHub Actions handles automatic test branch creation on dev pushes

---

## ❓ Questions?

Refer to:
- [Jest Documentation](https://jestjs.io/)
- [CodeRabbit Docs](https://docs.coderabbit.ai/)
- [GitHub Actions Workflow Guide](https://docs.github.com/en/actions)
