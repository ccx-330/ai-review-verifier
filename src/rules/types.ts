import { ChangedFile } from "../diff";

export interface RuleResult {
  ruleId: string;
  severity: "info" | "warning" | "error";
  message: string;
  filename?: string;
  lineNumber?: number;
}

export interface Rule {
  id: string;
  description: string;
  run(files: ChangedFile[]): RuleResult[];
}
