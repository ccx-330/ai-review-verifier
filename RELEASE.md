# Release Process

Follow these steps to publish a new version.

## 1. Update Version

Edit `package.json`:

```json
{
  "version": "X.Y.Z"
}
```

## 2. Update CHANGELOG.md

Add a new section at the top:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...
```

## 3. Update README.md

Update all version references (e.g. `@v0.7.0` → `@vX.Y.Z`).

## 4. Build and Verify

```bash
npm run build
npm run lint
npm test
npm run package
npm run check-dist
```

All commands must pass. `check-dist` ensures `dist/index.js` is in sync with the source.

## 5. Commit

```bash
git add -A
git commit -m "release: vX.Y.Z"
```

## 6. Tag

```bash
git tag vX.Y.Z
```

## 7. Push

```bash
git push origin main
git push origin vX.Y.Z
```

## 8. Create GitHub Release

1. Go to [Releases](https://github.com/ccx-330/ai-review-verifier/releases)
2. Click **Draft a new release**
3. Choose the tag `vX.Y.Z`
4. Title: `vX.Y.Z`
5. Copy the changelog entry into the description
6. Click **Publish release**

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **Major** (X): Breaking changes to inputs/outputs or action behavior
- **Minor** (Y): New features, new rules, new inputs (backward compatible)
- **Patch** (Z): Bug fixes, documentation, dependency updates
