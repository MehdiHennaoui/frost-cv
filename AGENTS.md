## Skill loading

Local skills live under `.agents/skills/` (and `.claude/skills/` symlinks). Before substantial edits, pick a matching skill by name and follow its `SKILL.md`. Do not assume `@tanstack/intent` is installed.

## Project rules (always apply)

These rules apply on every task, for any agent. Source of truth: `.agents/rules/`. Read each file and follow it.

- [English only](.agents/rules/english-only.md)
- [FSD CLI scaffolding](.agents/rules/fsd-cli.md)
- [Git branch naming](.agents/rules/git-branch-naming.md)
- [Lint after edits](.agents/rules/lint-after-edits.md)
- [React conditional render](.agents/rules/react-conditional-render.md)
- [shadcn UI only](.agents/rules/shadcn-ui-only.md)

## Review standards

Judgement-call standards for review (not always loaded into implementation): [CODING_STANDARDS.md](CODING_STANDARDS.md).

## Navigation

- CV editor section pattern (forms, TipTap, autosave): [CODING_STANDARDS.md — Editor sections](CODING_STANDARDS.md#editor-sections) and [docs/agents/testing-autosave.md](docs/agents/testing-autosave.md).
