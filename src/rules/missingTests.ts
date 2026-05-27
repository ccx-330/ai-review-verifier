import { ChangedFile } from "../diff";
import { Rule, RuleResult } from "./types";

const CODE_PATTERN = /^src\/.+\.(ts|tsx|js|jsx)$/;
const TEST_PATTERNS = [
  /^test\//,
  /^tests\//,
  /__tests__\//,
  /\.(test|spec)\.[jt]sx?$/,
];

export const missingTestsRule: Rule = {
  id: "missing-tests",
  description: "Warn when source files are changed without corresponding test changes",
  run(files: ChangedFile[]): RuleResult[] {
    const changedCodeFiles = files.filter((f) => CODE_PATTERN.test(f.filename));
    if (changedCodeFiles.length === 0) return [];

    const hasTestChanges = files.some((f) =>
      TEST_PATTERNS.some((pattern) => pattern.test(f.filename))
    );

    if (!hasTestChanges) {
      return [
        {
          ruleId: "missing-tests",
          severity: "warning",
          message: `Changed ${changedCodeFiles.length} source file(s) in src/ but no test files were updated.`,
        },
      ];
    }

    return [];
  },
};
