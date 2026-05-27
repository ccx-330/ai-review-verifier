import { ChangedFile } from "../diff";
import { Config } from "../config";
import { consoleLogRule } from "../rules/consoleLog";
import { todoCommentRule } from "../rules/todoComment";
import { largeFileRule } from "../rules/largeFile";
import { missingTestsRule } from "../rules/missingTests";
import { debuggerRule } from "../rules/debugger";
import { secretDetectionRule } from "../rules/secretDetection";
import { packageChangeRule } from "../rules/packageChange";
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

const defaultConfig: Config = {
  rules: {
    "console-log": true,
    "todo-comment": true,
    "large-file": true,
    "missing-tests": true,
    "debugger": true,
    "secret-detection": true,
    "package-change": true,
  },
  largeFileThreshold: 300,
  ignore: [],
};

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

    const results = consoleLogRule.run(files, defaultConfig);

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

    const results = consoleLogRule.run(files, defaultConfig);

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

    const results = todoCommentRule.run(files, defaultConfig);

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

    const results = todoCommentRule.run(files, defaultConfig);

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

    const results = todoCommentRule.run(files, defaultConfig);

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

    const results = largeFileRule.run(files, defaultConfig);

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

    const results = largeFileRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("ignores dist/ files even when over threshold", () => {
    const files = [
      makeFile({ filename: "dist/index.js", additions: 1000 }),
      makeFile({ filename: "dist/licenses.txt", additions: 500 }),
    ];

    const results = largeFileRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("ignores lib/, build/, coverage/, node_modules/", () => {
    const files = [
      makeFile({ filename: "lib/bundle.js", additions: 500 }),
      makeFile({ filename: "build/output.js", additions: 500 }),
      makeFile({ filename: "coverage/lcov-report/index.html", additions: 500 }),
      makeFile({ filename: "node_modules/pkg/index.js", additions: 500 }),
    ];

    const results = largeFileRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("ignores *.min.js and package-lock.json", () => {
    const files = [
      makeFile({ filename: "vendor/app.min.js", additions: 500 }),
      makeFile({ filename: "package-lock.json", additions: 500 }),
    ];

    const results = largeFileRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("still flags src/ files over threshold", () => {
    const files = [
      makeFile({ filename: "src/index.ts", additions: 301 }),
    ];

    const results = largeFileRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("large-file");
  });

  it("uses custom threshold from config", () => {
    const files = [
      makeFile({ filename: "src/big.ts", additions: 500 }),
    ];
    const config = { ...defaultConfig, largeFileThreshold: 1000 };

    const results = largeFileRule.run(files, config);

    expect(results).toHaveLength(0);
  });
});

describe("missingTestsRule", () => {
  it("warns when src/ code is changed without test changes", () => {
    const files = [
      makeFile({ filename: "src/app.ts" }),
      makeFile({ filename: "src/utils.ts" }),
    ];

    const results = missingTestsRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("missing-tests");
    expect(results[0].severity).toBe("warning");
  });

  it("does not warn when test files are also changed", () => {
    const files = [
      makeFile({ filename: "src/app.ts" }),
      makeFile({ filename: "__tests__/app.test.ts" }),
    ];

    const results = missingTestsRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("does not warn when only non-src files change", () => {
    const files = [makeFile({ filename: "README.md" })];

    const results = missingTestsRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });
});

describe("debuggerRule", () => {
  it("detects debugger in added lines", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [{ lineNumber: 7, content: "debugger" }],
      }),
    ];

    const results = debuggerRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("debugger");
    expect(results[0].severity).toBe("warning");
    expect(results[0].filename).toBe("src/app.ts");
    expect(results[0].lineNumber).toBe(7);
  });

  it("ignores lines with ai-review-verifier-ignore", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [{ lineNumber: 7, content: "debugger // ai-review-verifier-ignore" }],
      }),
    ];

    const results = debuggerRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });
});

describe("secretDetectionRule", () => {
  it("detects ghp_ token", () => {
    const files = [
      makeFile({
        filename: "src/config.ts",
        addedLines: [{ lineNumber: 3, content: 'const token = "ghp_abcdefghijklmnopqrstuvwxyz1234567890abcd";' }],
      }),
    ];

    const results = secretDetectionRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("secret-detection");
    expect(results[0].severity).toBe("error");
  });

  it("detects sk- token", () => {
    const files = [
      makeFile({
        filename: "src/config.ts",
        addedLines: [{ lineNumber: 3, content: 'const key = "sk-abcdefghijklmnopqrstuvwxyz1234";' }],
      }),
    ];

    const results = secretDetectionRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("secret-detection");
  });

  it("detects PRIVATE KEY", () => {
    const files = [
      makeFile({
        filename: "key.pem",
        addedLines: [{ lineNumber: 1, content: "-----BEGIN PRIVATE KEY-----" }],
      }),
    ];

    const results = secretDetectionRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("secret-detection");
  });

  it("ignores lines with ai-review-verifier-ignore", () => {
    const files = [
      makeFile({
        filename: "src/config.ts",
        addedLines: [{ lineNumber: 3, content: 'const token = "ghp_test123"; // ai-review-verifier-ignore' }],
      }),
    ];

    const results = secretDetectionRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });
});

describe("packageChangeRule", () => {
  it("warns when only package.json is changed", () => {
    const files = [
      makeFile({ filename: "package.json" }),
    ];

    const results = packageChangeRule.run(files, defaultConfig);

    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe("package-change");
    expect(results[0].severity).toBe("warning");
  });

  it("does not warn when package-lock.json is also changed", () => {
    const files = [
      makeFile({ filename: "package.json" }),
      makeFile({ filename: "package-lock.json" }),
    ];

    const results = packageChangeRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("does not warn when yarn.lock is also changed", () => {
    const files = [
      makeFile({ filename: "package.json" }),
      makeFile({ filename: "yarn.lock" }),
    ];

    const results = packageChangeRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("does not warn when pnpm-lock.yaml is also changed", () => {
    const files = [
      makeFile({ filename: "package.json" }),
      makeFile({ filename: "pnpm-lock.yaml" }),
    ];

    const results = packageChangeRule.run(files, defaultConfig);

    expect(results).toHaveLength(0);
  });

  it("does not warn when package.json is not changed", () => {
    const files = [
      makeFile({ filename: "src/app.ts" }),
    ];

    const results = packageChangeRule.run(files, defaultConfig);

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

    const results = runRules(files, defaultConfig);

    const ruleIds = results.map((r) => r.ruleId);
    expect(ruleIds).toContain("console-log");
    expect(ruleIds).toContain("todo-comment");
    expect(ruleIds).toContain("large-file");
    expect(ruleIds).toContain("missing-tests");
  });

  it("skips disabled rules", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        addedLines: [{ lineNumber: 1, content: 'console.log("x")' }],
      }),
    ];
    const config: Config = {
      ...defaultConfig,
      rules: { ...defaultConfig.rules, "console-log": false },
    };

    const results = runRules(files, config);

    const ruleIds = results.map((r) => r.ruleId);
    expect(ruleIds).not.toContain("console-log");
  });

  it("filters out ignored files before running rules", () => {
    const files = [
      makeFile({
        filename: "src/app.ts",
        additions: 10,
        addedLines: [],
      }),
      makeFile({
        filename: "vendor/lib.ts",
        additions: 500,
        addedLines: [{ lineNumber: 1, content: 'console.log("x")' }],
      }),
    ];
    const config: Config = { ...defaultConfig, ignore: ["^vendor/"], rules: { ...defaultConfig.rules, "missing-tests": false } };

    const results = runRules(files, config);

    expect(results).toHaveLength(0);
  });
});
