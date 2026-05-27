import { RuleResult } from "./rules/types";

export interface FailureOptions {
  failOnWarning: boolean;
  failOnError: boolean;
}

export function shouldFail(
  results: RuleResult[],
  options: FailureOptions
): { failed: boolean; message?: string } {
  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");

  if (options.failOnError && errors.length > 0) {
    return {
      failed: true,
      message: `Found ${errors.length} error(s) and ${warnings.length} warning(s). Failing due to fail-on-error.`,
    };
  }

  if (options.failOnWarning && (warnings.length > 0 || errors.length > 0)) {
    return {
      failed: true,
      message: `Found ${warnings.length} warning(s) and ${errors.length} error(s). Failing due to fail-on-warning.`,
    };
  }

  return { failed: false };
}
