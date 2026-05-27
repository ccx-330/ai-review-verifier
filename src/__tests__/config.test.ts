import * as fs from "fs";
import { loadConfig } from "../config";

jest.mock("fs");

const mockedFs = jest.mocked(fs);

describe("loadConfig", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns default config when file does not exist", () => {
    mockedFs.existsSync.mockReturnValue(false);

    const config = loadConfig();

    expect(config.rules["console-log"]).toBe(true);
    expect(config.rules["todo-comment"]).toBe(true);
    expect(config.rules["large-file"]).toBe(true);
    expect(config.rules["missing-tests"]).toBe(true);
    expect(config.largeFileThreshold).toBe(300);
    expect(config.ignore).toEqual([]);
  });

  it("parses rules toggle from YAML", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(`
rules:
  console-log: false
  todo-comment: false
`);

    const config = loadConfig();

    expect(config.rules["console-log"]).toBe(false);
    expect(config.rules["todo-comment"]).toBe(false);
    expect(config.rules["large-file"]).toBe(true);
  });

  it("parses largeFileThreshold from YAML", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(`largeFileThreshold: 1000`);

    const config = loadConfig();

    expect(config.largeFileThreshold).toBe(1000);
  });

  it("parses ignore patterns from YAML", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(`
ignore:
  - "^vendor/"
  - '.generated.'
`);

    const config = loadConfig();

    expect(config.ignore).toEqual(["^vendor/", ".generated."]);
  });

  it("returns defaults for empty YAML file", () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue("");

    const config = loadConfig();

    expect(mockedFs.readFileSync).toHaveBeenCalled();
    expect(config.largeFileThreshold).toBe(300);
    expect(config.rules["console-log"]).toBe(true);
  });
});
