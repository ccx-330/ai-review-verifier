import * as core from "@actions/core";
import { emitAnnotations } from "../annotations";
import { RuleResult } from "../rules/types";

jest.mock("@actions/core");

const mockedCore = jest.mocked(core);

describe("emitAnnotations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls core.warning for warning severity with file and line", () => {
    const results: RuleResult[] = [
      {
        ruleId: "console-log",
        severity: "warning",
        message: "Avoid console.log in committed code.",
        filename: "src/app.ts",
        lineNumber: 12,
      },
    ];

    emitAnnotations(results);

    expect(mockedCore.warning).toHaveBeenCalledWith(
      "[console-log] Avoid console.log in committed code.",
      { file: "src/app.ts", startLine: 12 }
    );
  });

  it("calls core.error for error severity with file and line", () => {
    const results: RuleResult[] = [
      {
        ruleId: "custom-rule",
        severity: "error",
        message: "Critical issue found.",
        filename: "src/broken.ts",
        lineNumber: 5,
      },
    ];

    emitAnnotations(results);

    expect(mockedCore.error).toHaveBeenCalledWith(
      "[custom-rule] Critical issue found.",
      { file: "src/broken.ts", startLine: 5 }
    );
  });

  it("calls core.notice for info severity without file or line", () => {
    const results: RuleResult[] = [
      {
        ruleId: "missing-tests",
        severity: "info",
        message: "No test files updated.",
      },
    ];

    emitAnnotations(results);

    expect(mockedCore.notice).toHaveBeenCalledWith(
      "[missing-tests] No test files updated.",
      {}
    );
  });

  it("emits multiple annotations for multiple results", () => {
    const results: RuleResult[] = [
      {
        ruleId: "console-log",
        severity: "warning",
        message: "msg1",
        filename: "a.ts",
        lineNumber: 1,
      },
      {
        ruleId: "todo-comment",
        severity: "info",
        message: "msg2",
        filename: "b.ts",
        lineNumber: 2,
      },
    ];

    emitAnnotations(results);

    expect(mockedCore.warning).toHaveBeenCalledTimes(1);
    expect(mockedCore.notice).toHaveBeenCalledTimes(1);
  });
});
