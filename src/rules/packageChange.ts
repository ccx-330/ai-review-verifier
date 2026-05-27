import { ChangedFile } from "../diff";
import { Config } from "../config";
import { Rule, RuleResult } from "./types";

export const packageChangeRule: Rule = {
  id: "package-change",
  description: "Warn when package.json is changed without a lockfile update",
  run(files: ChangedFile[], _config: Config): RuleResult[] {
    const filenames = new Set(files.map((f) => f.filename));

    if (!filenames.has("package.json")) return [];

    const lockfiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
    const hasLockfileChange = lockfiles.some((lf) => filenames.has(lf));

    if (!hasLockfileChange) {
      return [
        {
          ruleId: "package-change",
          severity: "warning",
          message: "package.json changed without a lockfile update.",
        },
      ];
    }

    return [];
  },
};
