import { ChangedFile } from "../diff";
import { Rule, RuleResult } from "./types";

const TODO_PATTERN = /\b(TODO|FIXME)\b/;
const IGNORE_PATTERN = /ai-review-verifier-ignore/;

export const todoCommentRule: Rule = {
  id: "todo-comment",
  description: "Detect TODO and FIXME comments in added lines",
  run(files: ChangedFile[]): RuleResult[] {
    const results: RuleResult[] = [];

    for (const file of files) {
      for (const line of file.addedLines) {
        if (IGNORE_PATTERN.test(line.content)) continue;
        if (TODO_PATTERN.test(line.content)) {
          results.push({
            ruleId: "todo-comment",
            severity: "info",
            message: "Found TODO/FIXME comment.",
            filename: file.filename,
            lineNumber: line.lineNumber,
          });
        }
      }
    }

    return results;
  },
};
