# Contributing

Thank you for your interest in contributing to AI Review Verifier!

## Getting Started

```bash
git clone https://github.com/ccx-330/ai-review-verifier.git
cd ai-review-verifier
npm install
```

## Development Commands

| Command | Description |
| --- | --- |
| `npm run build` | Compile TypeScript to `lib/` |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run package` | Bundle into `dist/index.js` |

## Adding a New Rule

1. Create a new file in `src/rules/` (e.g. `src/rules/myRule.ts`):

```typescript
import { ChangedFile } from "../diff";
import { Config } from "../config";
import { Rule, RuleResult } from "./types";

export const myRule: Rule = {
  id: "my-rule",
  description: "What this rule checks",
  run(files: ChangedFile[], _config: Config): RuleResult[] {
    const results: RuleResult[] = [];
    // your logic here
    return results;
  },
};
```

2. Register it in `src/rules/index.ts`:
   - Import the rule
   - Add it to the `allRules` array with its config key

3. Add the config key to `src/config.ts`:
   - Add the key to the `Config.rules` interface
   - Add the default value to `DEFAULT_CONFIG`

4. Add tests in `src/__tests__/rules.test.ts`

5. Update `README.md` rules table and config reference

## Before Submitting a PR

Run the full pipeline and make sure everything passes:

```bash
npm run build
npm run lint
npm test
npm run package
```

**Important:** `dist/index.js` must be committed. It is the file that GitHub Actions actually runs. After running `npm run package`, commit the updated `dist/` directory.

## Code Style

- TypeScript with strict mode
- ESLint for linting
- Jest for testing
- Keep rules self-contained in their own files
- Use `// ai-review-verifier-ignore` to skip a rule on a specific line
