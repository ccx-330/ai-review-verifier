import * as fs from "fs";
import * as yaml from "js-yaml";
import * as core from "@actions/core";

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
  allowlist: {
    paths: string[];
    secrets: string[];
    rules: Record<string, string[]>;
  };
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
  allowlist: {
    paths: [],
    secrets: [],
    rules: {},
  },
};

const CONFIG_FILE = ".ai-review-verifier.yml";

export function loadConfig(configPath?: string): Config {
  const filePath = configPath ?? CONFIG_FILE;

  if (!fs.existsSync(filePath)) {
    return cloneConfig(DEFAULT_CONFIG);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as Record<string, unknown> | null;

  if (parsed === null || parsed === undefined || typeof parsed !== "object") {
    return cloneConfig(DEFAULT_CONFIG);
  }

  return mergeConfig(parsed);
}

function cloneConfig(src: Config): Config {
  return {
    rules: { ...src.rules },
    largeFileThreshold: src.largeFileThreshold,
    ignore: [...src.ignore],
    allowlist: {
      paths: [...src.allowlist.paths],
      secrets: [...src.allowlist.secrets],
      rules: { ...src.allowlist.rules },
    },
  };
}

function mergeConfig(raw: Record<string, unknown>): Config {
  const config = cloneConfig(DEFAULT_CONFIG);

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

  if (raw.allowlist && typeof raw.allowlist === "object") {
    const allowlist = raw.allowlist as Record<string, unknown>;

    if (Array.isArray(allowlist.paths)) {
      config.allowlist.paths = allowlist.paths.filter((item): item is string => typeof item === "string");
    }

    if (Array.isArray(allowlist.secrets)) {
      config.allowlist.secrets = allowlist.secrets.filter((item): item is string => typeof item === "string");
    }

    if (allowlist.rules && typeof allowlist.rules === "object") {
      const rules = allowlist.rules as Record<string, unknown>;
      for (const [key, value] of Object.entries(rules)) {
        if (Array.isArray(value)) {
          config.allowlist.rules[key] = value.filter((item): item is string => typeof item === "string");
        }
      }
    }
  }

  return config;
}

export function compilePattern(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    core.warning(`Invalid regex pattern in config, skipping: ${pattern}`);
    return null;
  }
}
