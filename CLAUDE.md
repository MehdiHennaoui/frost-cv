# Claude Code

Always apply the project rules (same source as Cursor / other agents):

@.agents/rules/comments-only-when-tricky.md
@.agents/rules/english-only.md
@.agents/rules/fsd-cli.md
@.agents/rules/git-branch-naming.md
@.agents/rules/lint-after-edits.md
@.agents/rules/no-legacy-cv-pre-prod.md
@.agents/rules/react-conditional-render.md
@.agents/rules/shadcn-ui-only.md

Also follow [AGENTS.md](AGENTS.md) (skill loading + rule index). Review judgement calls: [CODING_STANDARDS.md](CODING_STANDARDS.md).

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/` at repo root, created lazily). See `docs/agents/domain.md`.
