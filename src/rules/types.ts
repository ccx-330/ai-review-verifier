import { ChangedFile } from "../diff";
import { Config } from "../config";

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
  run(files: ChangedFile[], config: Config): RuleResult[];
}
