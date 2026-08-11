---
name: ai-memory-durable-pages
description: "Use when the user explicitly asks to remember, save, pin, or annotate permanent project knowledge. Not for handoffs or routine notes."
---
<!-- ai-memory-managed: routing-skill -->

# ai-memory durable pages

Use this skill when the user explicitly asks to remember, save, pin, or annotate permanent project knowledge.

## Tools in this cluster

- `memory_write_page` to write or update a durable wiki page
- `memory_delete_page` to delete a page by exact path

## When to use

User explicitly asks to:
- "remember this"
- "save this for later"
- "pin this rule"
- "annotate this decision"
- "make a note about X"
- "record that we decided Y"
- "write down this gotcha"

## Do not use for

- Handoffs between sessions → use `memory_handoff_begin`
- Routine session notes → lifecycle hooks capture observations automatically
- Mid-session summaries → just conversation

## Title convention

**Prefer omitting the `title` argument.** Put the title as a `# H1` on the first line of `body` — ai-memory derives the title from that H1 (or the path stem if no heading exists).

Passing `title` explicitly forces JSON-escaping, which is a known source of `JSON parsing` errors when the title contains quotes, colons, or punctuation (issue #67). Only set `title` when there's no usable H1 in the body.

## Path and namespace

Choose a stable relative path:
- `notes/<topic>.md` for general notes
- `concepts/<topic>.md` for domain concepts
- `decisions/<topic>.md` for architectural decisions
- `gotchas/<topic>.md` for warnings and pitfalls
- `_rules/<topic>.md` for standing project rules
- `procedures/<topic>.md` for checklists and runbooks

Namespace affects retrieval authority: `_rules/`, `decisions/`, `procedures/`, and `gotchas/` get a bounded ranking boost over session evidence.

## Tier and pinning

`tier` defaults to `semantic`. Options:
- `working` for scratchpad
- `episodic` for session-specific notes (sweep-eligible)
- `semantic` for maintained knowledge
- `procedural` for checklists and runbooks

Set `pinned: true` for facts that should never decay. The forget sweep skips pinned pages.

## TTL

For explicitly time-bounded notes, pass `expires_at` as RFC3339 (`2026-09-01T12:00:00Z`) or bare date (`2026-09-01` = end of that day, UTC). After expiry:
- Page is hidden from search/recent/briefing
- Hard-deleted by the next forget sweep
- TTL outranks `pinned`

Omit for pages that never expire.

## Global scope

For standing user/team preferences that apply to EVERY project (tech choices, code style, durable personal rules), pass `scope: "global"`. The page lands in the reserved `_global` scope and default `memory_query` calls surface it in every project.

Cannot be combined with `workspace`/`project`.

## Delete

`memory_delete_page` removes a page by exact path. Idempotent. Fires the admission chain so mirrors/backups stay consistent.

Pass `workspace` + `project` together only when the page lives in a sibling workspace/project. Missing explicit scopes fail closed instead of falling back.

## Scope

- Default: current project
- Pass `workspace` + `project` together only when writing to a named sibling workspace/project
- When set to a name that doesn't exist yet, the project is **created** — writes always land where asked, never silently in the current project
