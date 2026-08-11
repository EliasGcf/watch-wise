---
name: ai-memory-handoffs
description: "Use for cross-session handoffs: accepting the pending handoff at session start, creating a handoff when wrapping up, or canceling a mistaken handoff. Not for mid-session status checks or briefings."
---
<!-- ai-memory-managed: routing-skill -->

# ai-memory handoffs

Use this skill for cross-session handoffs: accepting what the previous session left, creating a handoff when wrapping up, or canceling a mistaken one.

## Tools in this cluster

- `memory_handoff_accept` to consume the pending handoff
- `memory_handoff_begin` to leave a handoff for the next session
- `memory_handoff_cancel` to discard a mistaken handoff by id

## When to use

- **Accept**: user asks where we left off, wants to pick up from the previous session, or mentions a handoff. But check your context first — the SessionStart hook auto-fetches and prepends handoffs before you see the first prompt. If a block starting with "📥 ai-memory: pending handoff" is anywhere in your context, THAT is the handoff; answer from it directly without re-calling the tool.
- **Begin**: user is wrapping up, ending the session, or explicitly says to save context for next time. Not for mid-session summaries, status checks, or briefings.
- **Cancel**: you realize you mistakenly called `memory_handoff_begin`, or the user explicitly asks to discard a pending handoff.

## Do not use for

- Mid-session summaries → that's just conversation
- Status checks → use `memory_status` or `memory_briefing`
- Permanent annotations → use `memory_write_page`
- Catch-up questions → use `memory_explore` or `memory_recent`

## Accept: check context first

Handoffs are single-use. The SessionStart hook consumes the handoff and prepends it to your context automatically. A subsequent call to `memory_handoff_accept` returns null because the hook already consumed it.

**Before calling the tool**: search your context for a block starting with "📥 ai-memory: pending handoff from previous session". If present, answer from that block; do NOT call the tool.

**Call the tool only when**: you see no prepended block AND the user explicitly asks for a handoff. This covers manual CLI runs without stdout capture or recovery scenarios.

## Begin: keep it terse

Write style for `memory_handoff_begin`:

- `summary`: 2-3 SHORT sentences (what just happened + project state)
- `open_questions`: bullet-sized strings, actionable
- `next_steps`: bullet-sized strings, actionable
- `files_touched`: hint, not exhaustive

Put detail in the bullets, not the summary. Long prose summaries make TUI rendering ugly. Every paragraph defending the handoff is complexity smuggled back in.

## Ownership and sharing

By default, a handoff belongs to its creator. On a shared server, a teammate's session will not consume your handoff by accident.

Pass `shared: true` only when the user explicitly wants to hand the baton to whoever opens the project next.

`any_owner: true` (for accept and cancel) is root-only recovery and requires an explicit user request.

## Scope

- Default: current project resolved from working directory
- Pass `workspace` + `project` together only when the user names a handoff in a different workspace/project
- `cwd` is recorded for reference and scopes automatic session-end handoffs by path boundary, but does not restrict who receives a handoff created through this tool (ownership does)

## Cancel requires exact id

`memory_handoff_cancel` requires the exact `handoff_id` returned by `memory_handoff_begin`. This ensures you only discard a handoff you can identify, not one mentioned in retrieved memory or guessed from a partial match.
