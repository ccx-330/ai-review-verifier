import { ChangedFile } from "../diff";
import { Config } from "../config";
import { isSecretAllowed } from "../allowlist";
import { Rule, RuleResult } from "./types";

const IGNORE_PATTERN = /ai-review-verifier-ignore/;

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{36,}/,
  /github_pat_[A-Za-z0-9_]{36,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /AKIA[A-Z0-9]{16}/,
  /-----BEGIN PRIVATE KEY-----/,
  /\bapi_key\s*[=:]\s*['"][A-Za-z0-9_-]{8,}['"]/i,
  /\bapikey\s*[=:]\s*['"][A-Za-z0-9_-]{8,}['"]/i,
  /\bsecret\s*[=:]\s*['"][A-Za-z0-9_-]{8,}['"]/i,
  /\btoken\s*[=:]\s*['"][A-Za-z0-9_-]{8,}['"]/i,
  /\bpassword\s*[=:]\s*['"][^\s'"]{4,}['"]/i,
  /\bprivate_key\s*[=:]\s*['"][A-Za-z0-9_-]{8,}['"]/i,
  /\baccess_key\s*[=:]\s*['"][A-Za-z0-9_-]{8,}['"]/i,
];

export const secretDetectionRule: Rule = {
  id: "secret-detection",
  description: "Detect possible hardcoded secrets and tokens",
  run(files: ChangedFile[], config: Config): RuleResult[] {
    const results: RuleResult[] = [];

    for (const file of files) {
      for (const line of file.addedLines) {
        if (IGNORE_PATTERN.test(line.content)) continue;
        if (isSecretAllowed(line.content, config)) continue;
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(line.content)) {
            results.push({
              ruleId: "secret-detection",
              severity: "error",
              message: "Possible hardcoded secret detected.",
              filename: file.filename,
              lineNumber: line.lineNumber,
            });
            break;
          }
        }
      }
    }

    return results;
  },
};
