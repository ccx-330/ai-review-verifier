import { parseAddedLines } from "../diff";

describe("parseAddedLines", () => {
  it("parses normal addition lines", () => {
    const patch = [
      "@@ -1,3 +1,5 @@",
      " context line",
      "+added line one",
      "+added line two",
      " another context",
    ].join("\n");

    const result = parseAddedLines(patch);

    expect(result).toEqual([
      { lineNumber: 2, content: "added line one" },
      { lineNumber: 3, content: "added line two" },
    ]);
  });

  it("ignores +++ and --- headers", () => {
    const patch = [
      "--- a/src/index.ts",
      "+++ b/src/index.ts",
      "@@ -1,3 +1,4 @@",
      " keep this",
      "+new line",
    ].join("\n");

    const result = parseAddedLines(patch);

    expect(result).toEqual([{ lineNumber: 2, content: "new line" }]);
  });

  it("handles multiple hunks", () => {
    const patch = [
      "@@ -1,3 +1,4 @@",
      " line1",
      "+added in first hunk",
      " line2",
      " line3",
      "@@ -10,3 +11,4 @@",
      " line10",
      "+added in second hunk",
      " line11",
    ].join("\n");

    const result = parseAddedLines(patch);

    expect(result).toEqual([
      { lineNumber: 2, content: "added in first hunk" },
      { lineNumber: 12, content: "added in second hunk" },
    ]);
  });

  it("returns empty array for empty patch", () => {
    expect(parseAddedLines("")).toEqual([]);
  });

  it("handles file with no patch (deleted lines only)", () => {
    const patch = [
      "@@ -1,5 +1,3 @@",
      " keep",
      "-removed one",
      "-removed two",
      " keep again",
    ].join("\n");

    const result = parseAddedLines(patch);

    expect(result).toEqual([]);
  });

  it("correctly tracks line numbers with deletions", () => {
    const patch = [
      "@@ -5,5 +5,6 @@",
      " context A",
      "-deleted line",
      " context B",
      "+new line after delete",
      " context C",
      "+another new line",
    ].join("\n");

    const result = parseAddedLines(patch);

    expect(result).toEqual([
      { lineNumber: 7, content: "new line after delete" },
      { lineNumber: 9, content: "another new line" },
    ]);
  });
});
