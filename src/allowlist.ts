import { Config, compilePattern } from "./config";

export function isPathAllowed(filename: string, config: Config): boolean {
  return config.allowlist.paths.some((pattern) => {
    const re = compilePattern(pattern);
    return re ? re.test(filename) : false;
  });
}

export function isSecretAllowed(content: string, config: Config): boolean {
  return config.allowlist.secrets.some((pattern) => {
    const re = compilePattern(pattern);
    return re ? re.test(content) : false;
  });
}

export function isRuleAllowed(ruleId: string, filename: string, config: Config): boolean {
  const patterns = config.allowlist.rules[ruleId];
  if (!patterns) return false;

  return patterns.some((pattern) => {
    const re = compilePattern(pattern);
    return re ? re.test(filename) : false;
  });
}

export function shouldSkipRuleResult(
  ruleId: string,
  filename: string | undefined,
  content: string | undefined,
  config: Config
): boolean {
  if (filename && isPathAllowed(filename, config)) return true;
  if (filename && isRuleAllowed(ruleId, filename, config)) return true;
  if (ruleId === "secret-detection" && content && isSecretAllowed(content, config)) return true;
  return false;
}
