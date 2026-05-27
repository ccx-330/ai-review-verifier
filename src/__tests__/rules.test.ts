import { ChangedFile } from "../diff";
import { consoleLogRule } from "../rules/consoleLog";
import { todoCommentRule } from "../rules/todoComment";
import { largeFileRule } from "../rules/largeFile";
import { missingTestsRule } from "../rules/missingTests";
import { runRules } from "../rules";

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

describe("consoleLogRule", () => {
  it("detects console.log in added lines", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [
          { lineNumber: 10, content: 'console.log("debug")' },
        ],
      }),
    ];

    const results = consoleLogRule.run(files);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("console-log");
    expect(results[0].severity).toBe("warning");
    expect(results[0].filename).toBe("src/app.ts");
    expect(results[0].lineNumber).toBe(10);
  });

  it("ignores lines with ai-review-verifier-ignore", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [
          { lineNumber: 10, content: 'console.log("debug") // ai-review-verifier-ignore' },
        ],
      }),
    ];

    const results = consoleLogRule.run(files);

    expect(results).toHaveLength(0);
  });
});

describe("todoCommentRule", () => {
  it("detects TODO comments", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [{ lineNumber: 5, content: "// TODO: fix this later" }],
      }),
    ];

    const results = todoCommentRule.run(files);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("todo-comment");
    expect(results[0].severity).toBe("info");
  });

  it("detects FIXME comments", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [{ lineNumber: 8, content: "// FIXME: broken logic" }],
      }),
    ];

    const results = todoCommentRule.run(files);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("todo-comment");
  });

  it("ignores lines with ai-review-verifier-ignore", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [{ lineNumber: 5, content: "// TODO: fix this // ai-review-verifier-ignore" }],
      }),
    ];

    const results = todoCommentRule.run(files);

    expect(results).toHaveLength(0);
  });
});

describe("largeFileRule", () => {
  it("flags files with more than 300 additions", () => {
    const files = [
      makeFile({
        filename: "src/huge.ts",
        additions: 301,
      }),
    ];

    const results = largeFileRule.run(files);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("large-file");
    expect(results[0].severity).toBe("warning");
  });

  it("does not flag files at or below threshold", () => {
    const files = [
      makeFile({
        filename: "src/ok.ts",
        additions: 300,
      }),
    ];

    const results = largeFileRule.run(files);

    expect(results).toHaveLength(0);
  });

  it("ignores dist/ files even when over threshold", () => {
    const files = [
      makeFile({ filename: "dist/index.js", additions: 1000 }),
      makeFile({ filename: "dist/licenses.txt", additions: 500 }),
    ];

    const results = largeFileRule.run(files);

    expect(results).toHaveLength(0);
  });

  it("ignores lib/, build/, coverage/, node_modules/", () => {
    const files = [
      makeFile({ filename: "lib/bundle.js", additions: 500 }),
      makeFile({ filename: "build/output.js", additions: 500 }),
      makeFile({ filename: "coverage/lcov-report/index.html", additions: 500 }),
      makeFile({ filename: "node_modules/pkg/index.js", additions: 500 }),
    ];

    const results = largeFileRule.run(files);

    expect(results).toHaveLength(0);
  });

  it("ignores *.min.js and package-lock.json", () => {
    const files = [
      makeFile({ filename: "vendor/app.min.js", additions: 500 }),
      makeFile({ filename: "package-lock.json", additions: 500 }),
    ];

    const results = largeFileRule.run(files);

    expect(results).toHaveLength(0);
  });

  it("still flags src/ files over threshold", () => {
    const files = [
      makeFile({ filename: "src/index.ts", additions: 301 }),
    ];

    const results = largeFileRule.run(files);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("large-file");
  });
});

describe("missingTestsRule", () => {
  it("warns when src/ code is changed without test changes", () => {
    const files = [
      makeFile({ filename: "src/app.ts" }),
      makeFile({ filename: "src/utils.ts" }),
    ];

    const results = missingTestsRule.run(files);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("missing-tests");
    expect(results[0].severity).toBe("warning");
  });

  it("does not warn when test files are also changed", () => {
    const files = [
      makeFile({ filename: "src/app.ts" }),
      makeFile({ filename: "__tests__/app.test.ts" }),
    ];

    const results = missingTestsRule.run(files);

    expect(results).toHaveLength(0);
  });

  it("does not warn when only non-src files change", () => {
    const files = [makeFile({ filename: "README.md" })];

    const results = missingTestsRule.run(files);

    expect(results).toHaveLength(0);
  });
});

describe("runRules", () => {
  it("runs all rules and aggregates results", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        additions: 500,
        addedLines: [
          { lineNumber: 1, content: 'console.log("x")' },
          { lineNumber: 2, content: "// TODO: fix" },
        ],
      }),
    ];

    const results = runRules(files);

    const ruleIds = results.map((r) => r.ruleId);
    expect(ruleIds).toContain("console-log");
    expect(ruleIds).toContain("todo-comment");
    expect(ruleIds).toContain("large-file");
    expect(ruleIds).toContain("missing-tests");
  });
});
