import { ChangedFile } from "../diff";
import { Config } from "../config";
import { Rule, RuleResult } from "./types";

const IGNORE_PATTERN = /ai-review-verifier-ignore/;

export const debuggerRule: Rule = {
  id: "debugger",
  description: "Detect debugger statements in added lines",
  run(files: ChangedFile[], _config: Config): RuleResult[] {
    const results: RuleResult[] = [];

    for (const file of files) {
      for (const line of file.addedLines) {
        if (IGNORE_PATTERN.test(line.content)) continue;
        if (line.content.includes("debugger")) {
          results.push({
            ruleId: "debugger",
            severity: "warning",
            message: "Avoid committing debugger statements.",
            filename: file.filename,
            lineNumber: line.lineNumber,
          });
        }
      }
    }

    return results;
  },
};
