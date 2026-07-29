## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `EliasGcf/watch-wise`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo: read root `CONTEXT.md` and root `docs/adr/` when present. See `docs/agents/domain.md`.

### Tests

Run a single test file with Japa's `--files` filter, for example `bun run test --files=functional/library_entries.spec.ts`. The `--files` value is matched as a file path suffix. Do not pass the test file as a positional argument, because Japa treats positional arguments as suite names.

### Git commits

Use Conventional Commits for all commit messages, e.g. `feat: add catalog search`, `fix: handle missing movie runtime`, `refactor: rename show model to serie`, `test: replace deprecated assertions`, or `chore: update generated SDK`.
