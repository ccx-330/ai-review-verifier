import { ChangedFile } from "../diff";
import { RuleResult } from "../rules/types";
import { formatComment } from "../formatter";

function makeFile(overrides: Partial<ChangedFile> & { filename: string }): ChangedFile {
  return {
    status: "modified",
    additions: 1,
    deletions: 0,
    changes: 1,
    addedLines: [],
    ...overrides,
  };
}

describe("formatComment", () => {
  it("outputs 'No issues found' when results are empty", () => {
    const files = [
      makeFile({ filename: "src/app.ts", additions: 10, deletions: 2 }),
    ];

    const comment = formatComment(files, []);

    expect(comment).toContain("No issues found.");
    expect(comment).toContain("Changed files: 1");
    expect(comment).toContain("Total additions: 10");
    expect(comment).toContain("Total deletions: 2");
    expect(comment).not.toContain("### Issues");
  });

  it("outputs markdown table when there are results", () => {
    const files = [
      makeFile({ filename: "src/app.ts", additions: 10, deletions: 2 }),
    ];
    const results: RuleResult[] = [
      {
        ruleId: "console-log",
        severity: "warning",
        message: "Avoid console.log in committed code.",
        filename: "src/app.ts",
        lineNumber: 12,
      },
    ];

    const comment = formatComment(files, results);

    expect(comment).toContain("Found 1 potential issue(s).");
    expect(comment).toContain("### Issues");
    expect(comment).toContain("| warning | console-log | src/app.ts | 12 | Avoid console.log in committed code. |");
    expect(comment).toContain("### Summary");
    expect(comment).toContain("Changed files: 1");
  });

  it("escapes pipe characters in cell content", () => {
    const files = [
      makeFile({ filename: "src/app.ts", additions: 1, deletions: 0 }),
    ];
    const results: RuleResult[] = [
      {
        ruleId: "test",
        severity: "info",
        message: "value is a | b",
        filename: "src/app.ts",
      },
    ];

    const comment = formatComment(files, results);

    expect(comment).toContain("a \\| b");
  });
});
