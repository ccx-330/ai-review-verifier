import * as fs from "fs";
import * as yaml from "js-yaml";

export interface Config {
  rules: {
    "console-log": boolean;
    "todo-comment": boolean;
    "large-file": boolean;
    "missing-tests": boolean;
    "debugger": boolean;
    "secret-detection": boolean;
    "package-change": boolean;
  };
  largeFileThreshold: number;
  ignore: string[];
}

const DEFAULT_CONFIG: Config = {
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

const CONFIG_FILE = ".ai-review-verifier.yml";

export function loadConfig(configPath?: string): Config {
  const filePath = configPath ?? CONFIG_FILE;

  if (!fs.existsSync(filePath)) {
    return { rules: { ...DEFAULT_CONFIG.rules }, largeFileThreshold: DEFAULT_CONFIG.largeFileThreshold, ignore: [...DEFAULT_CONFIG.ignore] };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as Record<string, unknown> | null;

  if (parsed === null || parsed === undefined || typeof parsed !== "object") {
    return { rules: { ...DEFAULT_CONFIG.rules }, largeFileThreshold: DEFAULT_CONFIG.largeFileThreshold, ignore: [...DEFAULT_CONFIG.ignore] };
  }

  return mergeConfig(parsed);
}

function mergeConfig(raw: Record<string, unknown>): Config {
  const config: Config = {
    rules: { ...DEFAULT_CONFIG.rules },
    largeFileThreshold: DEFAULT_CONFIG.largeFileThreshold,
    ignore: [...DEFAULT_CONFIG.ignore],
  };

  if (raw.rules && typeof raw.rules === "object") {
    const rules = raw.rules as Record<string, unknown>;
    for (const key of Object.keys(config.rules)) {
      if (typeof rules[key] === "boolean") {
        (config.rules as Record<string, boolean>)[key] = rules[key] as boolean;
      }
    }
  }

  if (typeof raw.largeFileThreshold === "number") {
    config.largeFileThreshold = raw.largeFileThreshold;
  }

  if (Array.isArray(raw.ignore)) {
    config.ignore = raw.ignore.filter((item): item is string => typeof item === "string");
  }

  return config;
}
