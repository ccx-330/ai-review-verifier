import { ChangedFile } from "./diff";
import { RuleResult } from "./rules/types";
import { COMMENT_MARKER } from "./comment";

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function formatComment(files: ChangedFile[], results: RuleResult[]): string {
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  const lines: string[] = [COMMENT_MARKER, "", "## AI Review Verifier", ""];

  if (results.length === 0) {
    lines.push("No issues found.", "");
  } else {
    lines.push(`Found ${results.length} potential issue(s).`, "");
    lines.push("### Issues", "");
    lines.push(
      "| Severity | Rule | File | Line | Message |",
      "| --- | --- | --- | --- | --- |"
    );

    for (const r of results) {
      const severity = r.severity;
      const rule = r.ruleId;
      const file = r.filename ? escapeCell(r.filename) : "-";
      const line = r.lineNumber ? String(r.lineNumber) : "-";
      const message = escapeCell(r.message);
      lines.push(`| ${severity} | ${rule} | ${file} | ${line} | ${message} |`);
    }

    lines.push("");
  }

  lines.push("### Summary", "");
  lines.push(`Changed files: ${files.length}`);
  lines.push(`Total additions: ${totalAdditions}`);
  lines.push(`Total deletions: ${totalDeletions}`);

  return lines.join("\n");
}
