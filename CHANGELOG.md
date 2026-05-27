# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
