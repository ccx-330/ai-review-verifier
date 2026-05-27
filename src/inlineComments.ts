import * as github from "@actions/github";
import { RuleResult } from "./rules/types";
import { ChangedFile } from "./diff";

type Octokit = ReturnType<typeof github.getOctokit>;

const SEVERITY_ICON: Record<string, string> = {
  error: "❌ error",
  warning: "⚠️ warning",
  info: "ℹ️ info",
};

interface InlineCommentInput {
  octokit: Octokit;
  owner: string;
  repo: string;
  pull_number: number;
  commit_id: string;
  results: RuleResult[];
  files: ChangedFile[];
}

export function buildInlineComments(
  results: RuleResult[],
  files: ChangedFile[]
): Array<{ path: string; line: number; body: string }> {
  const fileMap = new Map(files.map((f) => [f.filename, f]));
  const comments: Array<{ path: string; line: number; body: string }> = [];

  for (const r of results) {
    if (!r.filename || !r.lineNumber) continue;

    const file = fileMap.get(r.filename);
    if (!file || !file.patch) continue;

    const addedLineNumbers = new Set(file.addedLines.map((l) => l.lineNumber));
    if (!addedLineNumbers.has(r.lineNumber)) continue;

    const icon = SEVERITY_ICON[r.severity] ?? r.severity;
    comments.push({
      path: r.filename,
      line: r.lineNumber,
      body: `${icon}\n\n[${r.ruleId}] ${r.message}`,
    });
  }

  return comments;
}

export async function createInlineComments(input: InlineCommentInput): Promise<void> {
  const { octokit, owner, repo, pull_number, commit_id, results, files } = input;

  const comments = buildInlineComments(results, files);

  if (comments.length === 0) {
    return;
  }

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number,
    commit_id,
    event: "COMMENT",
    body: "AI Review Verifier inline comments",
    comments,
  });
}
