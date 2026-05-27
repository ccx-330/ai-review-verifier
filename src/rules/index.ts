import { ChangedFile } from "../diff";
import { Rule, RuleResult } from "./types";
import { consoleLogRule } from "./consoleLog";
import { todoCommentRule } from "./todoComment";
import { largeFileRule } from "./largeFile";
import { missingTestsRule } from "./missingTests";

export { Rule, RuleResult } from "./types";

const rules: Rule[] = [
  consoleLogRule,
  todoCommentRule,
  largeFileRule,
  missingTestsRule,
];

export function runRules(files: ChangedFile[]): RuleResult[] {
  const results: RuleResult[] = [];

  for (const rule of rules) {
    results.push(...rule.run(files));
  }

  return results;
}
