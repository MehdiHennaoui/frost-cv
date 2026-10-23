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

## Do not

- Invent extra prefixes (`hotfix/`, `bugfix/`, `improvement/`, …). Urgency belongs in the PR, not the branch name.
- Use spaces, underscores, or PascalCase in the description.
- Create a branch unless the user asked for one (or the task clearly needs isolation).
