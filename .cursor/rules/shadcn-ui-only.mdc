---
description: App UI must use shadcn wrappers under @/shared/ui; never import @base-ui/react directly.
alwaysApply: true
globs: "**/*.{tsx,ts,jsx,js}"
---

# shadcn UI only

Use **shadcn** components from `@/shared/ui/*` for all product UI.

Do **not** import `@base-ui/react` (or any `@base-ui/react/*` subpath) from app, pages, features, or entities.

## Do

```tsx
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
```

If a component is missing, add it with the project CLI into `src/shared/ui/` (e.g. `pnpm dlx shadcn@latest add <component>`), then import from `@/shared/ui`.

## Exception

Only files under `src/shared/ui/` may import Base UI — those are the shadcn wrappers.

Biome enforces this via `noRestrictedImports` (allowed only in `src/shared/ui/**`).
