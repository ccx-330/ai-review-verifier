import { buildInlineComments, createInlineComments } from "../inlineComments";
import { ChangedFile } from "../diff";
import { RuleResult } from "../rules/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockOctokit = any;

function makeFile(overrides: Partial<ChangedFile> & { filename: string }): ChangedFile {
  return {
    status: "modified",
    additions: 1,
    deletions: 0,
    changes: 1,
    patch: "@@ -1,1 +1,2 @@\n line\n+new line",
    addedLines: [{ lineNumber: 2, content: "new line" }],
    ...overrides,
  };
}

describe("buildInlineComments", () => {
  it("returns empty when no results have filename and lineNumber", () => {
    const results: RuleResult[] = [
      { ruleId: "missing-tests", severity: "warning", message: "no tests" },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    expect(buildInlineComments(results, files)).toEqual([]);
  });

  it("builds comment for result with filename and lineNumber", () => {
    const results: RuleResult[] = [
      {
        ruleId: "console-log",
        severity: "warning",
        message: "Avoid console.log.",
        filename: "src/app.ts",
        lineNumber: 2,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    const comments = buildInlineComments(results, files);

    expect(comments).toHaveLength(1);
    expect(comments[0].path).toBe("src/app.ts");
    expect(comments[0].line).toBe(2);
    expect(comments[0].body).toContain("⚠️ warning");
    expect(comments[0].body).toContain("[console-log] Avoid console.log.");
  });

  it("skips result without filename", () => {
    const results: RuleResult[] = [
      { ruleId: "test", severity: "warning", message: "msg", lineNumber: 1 },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    expect(buildInlineComments(results, files)).toEqual([]);
  });

  it("skips result without lineNumber", () => {
    const results: RuleResult[] = [
      { ruleId: "test", severity: "warning", message: "msg", filename: "src/app.ts" },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    expect(buildInlineComments(results, files)).toEqual([]);
  });

  it("skips result when file not in fileMap", () => {
    const results: RuleResult[] = [
      {
        ruleId: "test",
        severity: "warning",
        message: "msg",
        filename: "missing.ts",
        lineNumber: 1,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    expect(buildInlineComments(results, files)).toEqual([]);
  });

  it("skips result when lineNumber is not in addedLines", () => {
    const results: RuleResult[] = [
      {
        ruleId: "test",
        severity: "warning",
        message: "msg",
        filename: "src/app.ts",
        lineNumber: 99,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    expect(buildInlineComments(results, files)).toEqual([]);
  });

  it("skips result when file has no patch", () => {
    const results: RuleResult[] = [
      {
        ruleId: "test",
        severity: "warning",
        message: "msg",
        filename: "src/app.ts",
        lineNumber: 2,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts", patch: undefined, addedLines: [] })];

    expect(buildInlineComments(results, files)).toEqual([]);
  });

  it("uses correct icon for error severity", () => {
    const results: RuleResult[] = [
      {
        ruleId: "secret-detection",
        severity: "error",
        message: "Secret detected.",
        filename: "src/app.ts",
        lineNumber: 2,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    const comments = buildInlineComments(results, files);

    expect(comments[0].body).toContain("❌ error");
  });

  it("uses correct icon for info severity", () => {
    const results: RuleResult[] = [
      {
        ruleId: "todo-comment",
        severity: "info",
        message: "Found TODO.",
        filename: "src/app.ts",
        lineNumber: 2,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    const comments = buildInlineComments(results, files);

    expect(comments[0].body).toContain("ℹ️ info");
  });

  it("merges multiple results into one list", () => {
    const results: RuleResult[] = [
      {
        ruleId: "console-log",
        severity: "warning",
        message: "msg1",
        filename: "src/app.ts",
        lineNumber: 2,
      },
      {
        ruleId: "debugger",
        severity: "warning",
        message: "msg2",
        filename: "src/app.ts",
        lineNumber: 2,
      },
    ];
    const files = [makeFile({ filename: "src/app.ts" })];

    expect(buildInlineComments(results, files)).toHaveLength(2);
  });
});

describe("createInlineComments", () => {
  it("does not call createReview when comments are empty", async () => {
    const createReview = jest.fn();
    const octokit = { rest: { pulls: { createReview } } };
    const files = [makeFile({ filename: "src/app.ts" })];

    await createInlineComments({
      octokit: octokit as MockOctokit,
      owner: "owner",
      repo: "repo",
      pull_number: 1,
      commit_id: "abc123",
      results: [{ ruleId: "missing-tests", severity: "warning", message: "no tests" }],
      files,
    });

    expect(createReview).not.toHaveBeenCalled();
  });

  it("calls createReview with all inline comments", async () => {
    const createReview = jest.fn();
    const octokit = { rest: { pulls: { createReview } } };
    const files = [makeFile({ filename: "src/app.ts" })];
    const results: RuleResult[] = [
      {
        ruleId: "console-log",
        severity: "warning",
        message: "msg",
        filename: "src/app.ts",
        lineNumber: 2,
      },
    ];

    await createInlineComments({
      octokit: octokit as MockOctokit,
      owner: "owner",
      repo: "repo",
      pull_number: 42,
      commit_id: "sha123",
      results,
      files,
    });

    expect(createReview).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      pull_number: 42,
      commit_id: "sha123",
      event: "COMMENT",
      body: "AI Review Verifier inline comments",
      comments: [
        expect.objectContaining({ path: "src/app.ts", line: 2 }),
      ],
    });
  });
});
