import * as core from "@actions/core";
import { RuleResult } from "./rules/types";

export function emitAnnotations(results: RuleResult[]): void {
  for (const r of results) {
    const properties: core.AnnotationProperties = {};
    if (r.filename) properties.file = r.filename;
    if (r.lineNumber) properties.startLine = r.lineNumber;

    const text = `[${r.ruleId}] ${r.message}`;

    switch (r.severity) {
      case "error":
        core.error(text, properties);
        break;
      case "warning":
        core.warning(text, properties);
        break;
      case "info":
        core.notice(text, properties);
        break;
    }
  }
}
