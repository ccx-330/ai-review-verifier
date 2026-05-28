# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.9.0] - 2026-05-28

### Added

- Allowlist support in `.ai-review-verifier.yml`
- `allowlist.paths` — exclude files matching regex patterns from all rules
- `allowlist.secrets` — exclude lines matching regex patterns from secret-detection
- `allowlist.rules` — per-rule file exclusions (key = rule id, value = list of regex patterns)
- `src/allowlist.ts` module with `isPathAllowed`, `isSecretAllowed`, `isRuleAllowed`, `shouldSkipRuleResult`
- `compilePattern` helper in config for safe regex compilation with warnings on invalid patterns

### Changed

- `runRules` now filters files through `allowlist.paths` and `allowlist.rules` before running each rule
- `secretDetectionRule` now skips lines matching `allowlist.secrets` patterns
- Example config updated with allowlist section

## [0.8.0] - 2026-05-27

### Added

- `check-dist` script to verify `dist/index.js` is in sync with source
- CI now runs `check-dist` on every PR
- `.github/release.yml` for automated release notes
- `.github/PULL_REQUEST_TEMPLATE.md` with submission checklist
- RELEASE.md with step-by-step release guide
- CI section in README

## [0.7.0] - 2026-05-27

### Added

- Inline review comments — post comments on specific diff lines
- `inline-comments` input (default: `false`)

## [0.6.0] - 2026-05-27

### Added
- CHANGELOG.md
- MIT License file
- CONTRIBUTING.md with development guide
- Example workflow files in `examples/`
- Example configuration file
- CI, version, and license badges in README
- GitHub Marketplace usage instructions

### Changed
- Updated action branding (icon: shield)
- Updated author to ccx-330

## [0.5.0] - 2026-05-27

### Added
- `debugger` rule — detects `debugger` statements in added lines
- `secret-detection` rule — detects possible hardcoded secrets (ghp_, sk-, AKIA, PRIVATE KEY, etc.)
- `package-change` rule — warns when package.json is changed without a lockfile update

## [0.4.0] - 2026-05-27

### Added
- `fail-on-warning` input — fail the workflow when warning or error issues are found
- `fail-on-error` input — fail the workflow when error issues are found

## [0.3.0] - 2026-05-27

### Added
- GitHub Checks annotations — rules emit error/warning/notice annotations in the PR Checks tab

## [0.2.0] - 2026-05-27

### Added
- Configuration file support via `.ai-review-verifier.yml`
- Toggle rules on/off
- Custom `largeFileThreshold`
- `ignore` patterns to exclude files from all rules

## [0.1.0] - 2026-05-27

### Added
- Initial release
- PR comment with summary of changed files and findings
- Upsert logic — updates existing comment instead of creating new ones
- `console-log` rule
- `todo-comment` rule
- `large-file` rule
- `missing-tests` rule
- Extensible rule engine
- 25 unit tests
