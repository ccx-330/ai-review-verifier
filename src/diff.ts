import * as github from "@actions/github";

export interface AddedLine {
  lineNumber: number;
  content: string;
}

export interface ChangedFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  addedLines: AddedLine[];
}

export function parseAddedLines(patch: string): AddedLine[] {
  const lines = patch.split("\n");
  const result: AddedLine[] = [];

  let currentNewLine = 0;

  for (const line of lines) {
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentNewLine = parseInt(hunkMatch[1], 10);
      continue;
    }

    if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }

    if (line.startsWith("+")) {
      result.push({
        lineNumber: currentNewLine,
        content: line.slice(1),
      });
      currentNewLine++;
    } else if (line.startsWith("-")) {
      continue;
    } else {
      currentNewLine++;
    }
  }

  return result;
}

export async function getChangedFiles(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<ChangedFile[]> {
  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  return files.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
    addedLines: file.patch ? parseAddedLines(file.patch) : [],
  }));
}
