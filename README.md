# AI Review Verifier

[![CI](https://github.com/ccx-330/ai-review-verifier/actions/workflows/test.yml/badge.svg)](https://github.com/ccx-330/ai-review-verifier/actions/workflows/test.yml)
[![GitHub release](https://img.shields.io/github/v/release/ccx-330/ai-review-verifier)](https://github.com/ccx-330/ai-review-verifier/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A GitHub Action that automatically reviews Pull Request diffs and comments on potential issues — so your team catches problems before a human reviewer even looks.

## Features

- Runs automatically on every Pull Request
- Posts (and updates) a single review comment — no comment spam
- Detects `console.log`, `debugger`, and `TODO`/`FIXME` comments
- Flags possible hardcoded secrets and tokens (severity: error)
- Warns when a single file has too many additions
- Checks that source changes include corresponding test updates
- Warns when `package.json` is changed without a lockfile update
- Annotations in the PR Checks tab (errors, warnings, notices)
- Configurable via `.ai-review-verifier.yml`
- Optionally fail the workflow on warnings or errors
- Easily extensible — add your own rules

## Quick Start

Create `.github/workflows/review.yml` in your repository:

```yaml
name: AI Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run AI Review Verifier
        uses: ccx-330/ai-review-verifier@v0.7.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

> **Tip:** Use a fixed version tag like `@v0.6.0` instead of `@main` to avoid breaking changes. See [Releases](https://github.com/ccx-330/ai-review-verifier/releases) for available versions.

## Usage Modes

| Mode | Description | Example |
| --- | --- | --- |
| **Basic** | Comment and annotate only, never fail | [examples/basic.yml](examples/basic.yml) |
| **Strict** | Fail on any warning or error | [examples/strict.yml](examples/strict.yml) |
| **Configured** | Custom rules and thresholds | [examples/configured.yml](examples/configured.yml) |
| **Inline** | Post review comments on specific lines | see below |

### Basic

```yaml
- uses: ccx-330/ai-review-verifier@v0.7.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Strict

```yaml
- uses: ccx-330/ai-review-verifier@v0.7.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    fail-on-warning: true
    fail-on-error: true
```

### Error-only

```yaml
- uses: ccx-330/ai-review-verifier@v0.7.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    fail-on-error: true
```

### Inline Comments

```yaml
- uses: ccx-330/ai-review-verifier@v0.7.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    inline-comments: true
```

When enabled, issues with file and line information are posted as inline review comments in the **Files changed** tab. The summary comment and annotations are still created.

> `fail-on-warning` triggers on both warning and error severity. `fail-on-error` only triggers on error severity. `info` never causes a failure.

## Rules

| Rule | Severity | Description |
| --- | --- | --- |
| `console-log` | warning | Detects `console.log(` in added lines |
| `todo-comment` | info | Detects `TODO` and `FIXME` comments |
| `large-file` | warning | Flags files with more than 300 additions |
| `missing-tests` | warning | Warns when `src/` code changes but no test files are updated |
| `debugger` | warning | Detects `debugger` statements |
| `secret-detection` | error | Detects possible hardcoded secrets and tokens |
| `package-change` | warning | Warns when `package.json` is changed without a lockfile update |

To skip a rule for a specific line, add `// ai-review-verifier-ignore` to that line.

## Configuration

Create `.ai-review-verifier.yml` in your repository root to customize behavior. All fields are optional — defaults are used when the file is missing.

See [examples/.ai-review-verifier.yml](examples/.ai-review-verifier.yml) for a complete example.

```yaml
rules:
  console-log: true
  todo-comment: true
  large-file: true
  missing-tests: true
  debugger: true
  secret-detection: true
  package-change: true

largeFileThreshold: 300

ignore:
  - "^vendor/"
  - "\\.generated\\."
```

### Config Reference

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `rules.console-log` | boolean | `true` | Enable/disable console.log detection |
| `rules.todo-comment` | boolean | `true` | Enable/disable TODO/FIXME detection |
| `rules.large-file` | boolean | `true` | Enable/disable large file warning |
| `rules.missing-tests` | boolean | `true` | Enable/disable missing tests warning |
| `rules.debugger` | boolean | `true` | Enable/disable debugger detection |
| `rules.secret-detection` | boolean | `true` | Enable/disable secret/token detection |
| `rules.package-change` | boolean | `true` | Enable/disable package.json lockfile check |
| `largeFileThreshold` | number | `300` | Additions threshold for large-file rule |
| `ignore` | string[] | `[]` | Regex patterns to exclude files from all rules |

### Adding Custom Rules

Create a new file in `src/rules/` that implements the `Rule` interface, then register it in `src/rules/index.ts`. See [CONTRIBUTING.md](CONTRIBUTING.md) for a step-by-step guide.

## GitHub Checks Annotations

In addition to the PR comment, the action emits annotations in the PR **Checks** tab:

- **error** severity — shown as an error annotation
- **warning** severity — shown as a warning annotation
- **info** severity — shown as a notice annotation

Each annotation includes the file path and line number when available, so you can click directly to the relevant code.

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `github-token` | Yes | `${{ github.token }}` | GitHub token for API access |
| `fail-on-warning` | No | `false` | Fail the workflow when warning or error issues are found |
| `fail-on-error` | No | `false` | Fail the workflow when error issues are found |
| `inline-comments` | No | `false` | Add inline review comments to changed lines |

## Outputs

| Output | Description |
| --- | --- |
| `comment-posted` | `"true"` if a comment was posted or updated |

## Permissions

The workflow must declare these permissions:

```yaml
permissions:
  contents: read
  pull-requests: write
```

## GitHub Marketplace

This action is available on the [GitHub Marketplace](https://github.com/marketplace). To use it:

1. Go to your repository's **Actions** tab
2. Click **New workflow**
3. Search for **AI Review Verifier**
4. Click **Use workflow** and configure as needed

Or simply add the workflow file as shown in [Quick Start](#quick-start).

## Releases and Versioning

This project follows [Semantic Versioning](https://semver.org/). Always use a fixed version tag in production:

```yaml
# Recommended — pinned to a specific release
uses: ccx-330/ai-review-verifier@v0.7.0

# Not recommended — may break at any time
uses: ccx-330/ai-review-verifier@main
```

See the [CHANGELOG](CHANGELOG.md) for a detailed release history.

## Example PR Comment

When issues are found:

```markdown
## AI Review Verifier

Found 2 potential issue(s).

### Issues

| Severity | Rule | File | Line | Message |
| --- | --- | --- | --- | --- |
| warning | console-log | src/app.ts | 12 | Avoid console.log in committed code. |
| warning | missing-tests | - | - | Changed 1 source file(s) in src/ but no test files were updated. |

### Summary

Changed files: 3
Total additions: 45
Total deletions: 3
```

When everything looks clean:

```markdown
## AI Review Verifier

No issues found.

### Summary

Changed files: 2
Total additions: 18
Total deletions: 5
```

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
```

### Common Commands

| Command | Description |
| --- | --- |
| `npm run build` | Compile TypeScript to `lib/` |
| `npm run package` | Bundle into `dist/index.js` (what the Action runs) |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

### Project Structure

```text
src/
├── index.ts          # Entry point — orchestrates the flow
├── diff.ts           # Fetches and parses PR file diffs
├── config.ts         # Loads .ai-review-verifier.yml
├── comment.ts        # Creates or updates the PR comment
├── formatter.ts      # Generates the Markdown comment body
├── annotations.ts    # Emits GitHub Checks annotations
├── failure.ts        # fail-on-warning / fail-on-error logic
├── inlineComments.ts # inline PR review comments
├── rules/
│   ├── types.ts      # Rule and RuleResult interfaces
│   ├── consoleLog.ts # console.log detection
│   ├── todoComment.ts# TODO/FIXME detection
│   ├── largeFile.ts  # Large file detection
│   ├── missingTests.ts# Missing test detection
│   ├── debugger.ts   # debugger detection
│   ├── secretDetection.ts # secret/token detection
│   ├── packageChange.ts   # lockfile check
│   └── index.ts      # runRules() aggregator
└── __tests__/        # Unit tests
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
