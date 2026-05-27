import { ChangedFile } from "../diff";
import { Config } from "../config";
import { Rule, RuleResult } from "./types";

const IGNORE_PATTERN = /ai-review-verifier-ignore/;

export const consoleLogRule: Rule = {
  id: "console-log",
  description: "Detect console.log statements in added lines",
  run(files: ChangedFile[], _config: Config): RuleResult[] {
    const results: RuleResult[] = [];

    for (const file of files) {
      for (const line of file.addedLines) {
        if (IGNORE_PATTERN.test(line.content)) continue;
        if (line.content.includes("console.log(")) {
          results.push({
            ruleId: "console-log",
            severity: "warning",
            message: "Avoid console.log in committed code.",
            filename: file.filename,
            lineNumber: line.lineNumber,
          });
        }
      }
    }

    return results;
  },
};
