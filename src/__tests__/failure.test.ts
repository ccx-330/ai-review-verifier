import { shouldFail } from "../failure";
import { RuleResult } from "../rules/types";

function makeResult(severity: RuleResult["severity"]): RuleResult {
  return { ruleId: "test-rule", severity, message: "test" };
}

describe("shouldFail", () => {
  it("does not fail when there are no results", () => {
    const result = shouldFail([], { failOnWarning: true, failOnError: true });
    expect(result.failed).toBe(false);
  });

  it("does not fail when only info results exist", () => {
    const results = [makeResult("info"), makeResult("info")];
    const result = shouldFail(results, { failOnWarning: true, failOnError: true });
    expect(result.failed).toBe(false);
  });

  it("fails when fail-on-error is true and error exists", () => {
    const results = [makeResult("error")];
    const result = shouldFail(results, { failOnWarning: false, failOnError: true });
    expect(result.failed).toBe(true);
    expect(result.message).toContain("1 error(s)");
  });

  it("does not fail when fail-on-error is true but only warning exists", () => {
    const results = [makeResult("warning")];
    const result = shouldFail(results, { failOnWarning: false, failOnError: true });
    expect(result.failed).toBe(false);
  });

  it("fails when fail-on-warning is true and warning exists", () => {
    const results = [makeResult("warning")];
    const result = shouldFail(results, { failOnWarning: true, failOnError: false });
    expect(result.failed).toBe(true);
    expect(result.message).toContain("1 warning(s)");
  });

  it("fails when fail-on-warning is true and error exists", () => {
    const results = [makeResult("error")];
    const result = shouldFail(results, { failOnWarning: true, failOnError: false });
    expect(result.failed).toBe(true);
    expect(result.message).toContain("1 error(s)");
  });

  it("never fails when both options are false", () => {
    const results = [makeResult("error"), makeResult("warning")];
    const result = shouldFail(results, { failOnWarning: false, failOnError: false });
    expect(result.failed).toBe(false);
  });
});
