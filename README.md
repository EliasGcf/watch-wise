# Watch Wise

## Tests

Run the full test suite:

```bash
bun run test
```

Run a single test file with Japa's `--files` filter:

```bash
bun run test --files=functional/library_entries.spec.ts
```

The `--files` value is matched as a file path suffix. Do not pass the test file as a positional argument, because Japa treats positional arguments as suite names.

Examples:

```bash
bun run test --files=functional/catalog_search.spec.ts
bun run test --files=functional/library_watched_marks.spec.ts
bun run test --files=unit/catalog_provider.spec.ts
```
