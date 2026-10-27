---
description: Name git branches with type/kebab-description prefixes (feature, fix, core, …).
alwaysApply: true
---

# Git branch naming

When creating a branch, use:

```text
<type>/<kebab-description>
```

## Types

| Prefix | Use for |
|--------|---------|
| `feature/` | New product capability (user stories, screens, flows) |
| `fix/` | Bug or regression |
| `core/` | Shared foundation: shared layer, infra, auth, design system, cross-cutting FSD work |
| `refactor/` | Restructure with no intentional behavior change |
| `chore/` | Deps, config, lint, CI, tooling |
| `docs/` | Documentation, ADRs, agent skills (when a branch is warranted) |
| `prototype/` | Throwaway prototypes (keep out of normal merge flow) |
| `research/` | Research notes; push without a PR; do not merge |

## Examples

- `feature/canadian-cv-export`
- `fix/login-redirect`
- `core/fsd-shared-ui`
- `chore/upgrade-eslint`
- `prototype/composer-layout`
- `research/ats-keywords`

## Tickets

When starting work on an issue-tracker ticket (`/implement`, a numbered `.scratch/.../issues/NN-*.md`, or an equivalent ticket ask):

1. Create and check out a branch **before** editing code (from up-to-date `main` / default base).
2. Name it from the ticket slug, e.g. `feature/form-pattern-tiptap-header` for `06-form-pattern-tiptap-header.md` (drop the numeric prefix; keep the kebab slug).
3. Commit on that branch only — never commit ticket work directly on `main`.

## Do not

- Invent extra prefixes (`hotfix/`, `bugfix/`, `improvement/`, …). Urgency belongs in the PR, not the branch name.
- Use spaces, underscores, or PascalCase in the description.
- Skip the ticket branch for “small” ticket work; isolation is required whenever a ticket is in play.
- Create a branch for vague chat-only nits with no ticket — only when the user asks or the task clearly needs isolation.
