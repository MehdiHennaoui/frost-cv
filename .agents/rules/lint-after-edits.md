---
description: After finishing code edits, always run Biome and Steiger before considering the task done.
alwaysApply: true
---

# Lint after edits

When you finish a batch of file changes (not mid-edit exploration), always run this before you stop:

```bash
pnpm lint:all
```

- Fix any issues it reports that your changes caused, then re-run until it passes.
- Skip only for pure Q&A / no file writes, or when the user explicitly asks not to lint.
- Do not skip because the change “looks small.”
