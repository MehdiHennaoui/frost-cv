## Skill loading

Local skills live under `.agents/skills/` (and `.claude/skills/` symlinks). Before substantial edits, pick a matching skill by name and follow its `SKILL.md`. Do not assume `@tanstack/intent` is installed.

## Project rules (always apply)

These rules apply on every task, for any agent. Source of truth: `.agents/rules/`. Read each file and follow it.

- [Comments only when tricky](.agents/rules/comments-only-when-tricky.md)
- [English only](.agents/rules/english-only.md)
- [FSD CLI scaffolding](.agents/rules/fsd-cli.md)
- [Git branch naming](.agents/rules/git-branch-naming.md)
- [Lint after edits](.agents/rules/lint-after-edits.md)
- [No em dash in product UI](.agents/rules/no-em-dash.md)
- [No legacy CV before prod](.agents/rules/no-legacy-cv-pre-prod.md)
- [React conditional render](.agents/rules/react-conditional-render.md)
- [shadcn UI only](.agents/rules/shadcn-ui-only.md)

## Review standards

Judgement-call standards for review (not always loaded into implementation): [CODING_STANDARDS.md](CODING_STANDARDS.md).

## Navigation

Where code lives (open these first; Glob concern folders when needed):

- Domain terms: [GLOSSARY.md](GLOSSARY.md). Decisions: [docs/adr/](docs/adr/).
- Persist / import / export / CV types: `src/entities/cv` (public API `@/entities/cv`).
- Library (list, create, delete, library import/export): `src/pages/cv-list`.
- Editor: `src/pages/cv-editor` — FSD segments `ui/` and `model/` only. Page shell alone at `ui/cv-editor-page.tsx`; all other code in `ui/<concern>/` or `model/<concern>/` (Glob those dirs for current concerns). Do not name concerns `shared` or `lib`. Slice public API stays `@/pages/cv-editor`.
- Routes: `src/app/routes`. shadcn: `src/shared/ui`. Cross-cutting helpers (`createAutosave`, sidebar portal): `src/shared/lib`. UI locale strings: `src/shared/i18n`.
- Editor patterns (forms, TipTap, autosave) + review judgement: [CODING_STANDARDS.md — Editor sections](CODING_STANDARDS.md#editor-sections). Autosave tests: [docs/agents/testing-autosave.md](docs/agents/testing-autosave.md). Section e2e: [docs/agents/testing-e2e.md](docs/agents/testing-e2e.md).
