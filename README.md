# AI Review Verifier

A GitHub Action that automatically reviews Pull Request diffs and comments on potential issues — so your team catches problems before a human reviewer even looks.

## Features

- Runs automatically on every Pull Request
- Posts (and updates) a single review comment — no comment spam
- Detects `console.log` statements left in code
- Flags `TODO` / `FIXME` comments
- Warns when a single file has too many additions
- Checks that source changes include corresponding test updates
- Easily extensible — add your own rules

## Quick Start

Add this workflow to your repository (e.g. `.github/workflows/review.yml`):

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
        uses: ccx-330/ai-review-verifier@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

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

## Rules

| Rule | Severity | Description |
| --- | --- | --- |
| `console-log` | warning | Detects `console.log(` in added lines |
| `todo-comment` | info | Detects `TODO` and `FIXME` comments |
| `large-file` | warning | Flags files with more than 300 additions |
| `missing-tests` | warning | Warns when `src/` code changes but no test files are updated |

To skip a rule for a specific line, add `// ai-review-verifier-ignore` to that line.

### Adding Custom Rules

Create a new file in `src/rules/` that implements the `Rule` interface, then register it in `src/rules/index.ts`:

```typescript
import { Rule, RuleResult } from "./types";
import { ChangedFile } from "../diff";

export const myRule: Rule = {
  id: "my-rule",
  description: "Description of what this rule checks",
  run(files: ChangedFile[]): RuleResult[] {
    // your logic here
    return [];
  },
};
```

## Permissions

The workflow must declare these permissions:

```yaml
permissions:
  contents: read
  pull-requests: write
```

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `github-token` | Yes | `${{ github.token }}` | GitHub token for API access |

## Outputs

| Output | Description |
| --- | --- |
| `comment-posted` | `"true"` if a comment was posted or updated |

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
├── comment.ts        # Creates or updates the PR comment
├── formatter.ts      # Generates the Markdown comment body
├── rules/
│   ├── types.ts      # Rule and RuleResult interfaces
│   ├── consoleLog.ts # console.log detection
│   ├── todoComment.ts# TODO/FIXME detection
│   ├── largeFile.ts  # Large file detection
│   ├── missingTests.ts# Missing test detection
│   └── index.ts      # runRules() aggregator
└── __tests__/        # Unit tests
```

## Roadmap

- [ ] Inline review comments on specific lines (not just a single summary comment)
- [ ] Configurable rules via `action.yml` inputs
- [ ] Custom rule patterns (regex-based)
- [ ] AI-powered code review integration
- [ ] Support for more file types and languages

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-rule`)
3. Run tests (`npm test`)
4. Commit your changes
5. Push to the branch and open a Pull Request

## License

MIT
