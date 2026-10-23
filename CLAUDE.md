# Claude Code

Always apply the project rules (same source as Cursor / other agents):

@.agents/rules/english-only.md
@.agents/rules/fsd-cli.md
@.agents/rules/lint-after-edits.md

Also follow [AGENTS.md](AGENTS.md) (Intent skill loading + rule index).

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/` at repo root, created lazily). See `docs/agents/domain.md`.
