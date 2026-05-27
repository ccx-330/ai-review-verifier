import { ChangedFile } from "../diff";
import { Config } from "../config";
import { Rule, RuleResult } from "./types";
import { consoleLogRule } from "./consoleLog";
import { todoCommentRule } from "./todoComment";
import { largeFileRule } from "./largeFile";
import { missingTestsRule } from "./missingTests";
import { debuggerRule } from "./debugger";
import { secretDetectionRule } from "./secretDetection";
import { packageChangeRule } from "./packageChange";

export { Rule, RuleResult } from "./types";

const allRules: Array<{ rule: Rule; configKey: keyof Config["rules"] }> = [
  { rule: consoleLogRule, configKey: "console-log" },
  { rule: todoCommentRule, configKey: "todo-comment" },
  { rule: largeFileRule, configKey: "large-file" },
  { rule: missingTestsRule, configKey: "missing-tests" },
  { rule: debuggerRule, configKey: "debugger" },
  { rule: secretDetectionRule, configKey: "secret-detection" },
  { rule: packageChangeRule, configKey: "package-change" },
];

function filterFiles(files: ChangedFile[], ignore: string[]): ChangedFile[] {
  if (ignore.length === 0) return files;
  const patterns = ignore.map((p) => new RegExp(p));
  return files.filter(
    (file) => !patterns.some((pattern) => pattern.test(file.filename))
  );
}

export function runRules(files: ChangedFile[], config: Config): RuleResult[] {
  const filtered = filterFiles(files, config.ignore);
  const results: RuleResult[] = [];

  for (const { rule, configKey } of allRules) {
    if (!config.rules[configKey]) continue;
    results.push(...rule.run(filtered, config));
  }

  return results;
}
