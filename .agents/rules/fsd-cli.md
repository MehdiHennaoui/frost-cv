---
description: Scaffold FSD layers, slices, and segments with @feature-sliced/cli instead of hand-creating folders.
alwaysApply: true
---

# FSD CLI for scaffolding

When creating new FSD layers, slices, or segments under `src/`, use the project CLI instead of `mkdir` / empty hand-written trees:

```bash
pnpm fsd <layer> <slice...> -s <segments...> -r src
```

Examples:

```bash
pnpm fsd p settings -s ui -r src
pnpm fsd f auth/login -s ui,model -r src
pnpm fsd e user -s model,api -r src
pnpm fsd s lib -r src
```

- Prefer `-r src` so generation lands next to existing `app` / `pages` / `shared`.
- After scaffolding, fill in real code (public API `index.ts`, components). Do not leave empty stubs if the task needs working code.
- You may still edit or move files by hand for tiny one-off tweaks; do not invent a parallel folder layout that fights FSD.
- Docs: https://github.com/feature-sliced/cli
