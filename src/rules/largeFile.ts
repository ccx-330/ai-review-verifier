import { ChangedFile } from "../diff";
import { Rule, RuleResult } from "./types";

const ADDITIONS_THRESHOLD = 300;

export const largeFileRule: Rule = {
  id: "large-file",
  description: "Flag files with too many additions",
  run(files: ChangedFile[]): RuleResult[] {
    const results: RuleResult[] = [];

    for (const file of files) {
      if (file.additions > ADDITIONS_THRESHOLD) {
        results.push({
          ruleId: "large-file",
          severity: "warning",
          message: `File has ${file.additions} additions (threshold: ${ADDITIONS_THRESHOLD}). Consider splitting into smaller changes.`,
          filename: file.filename,
        });
      }
    }

    return results;
  },
};
