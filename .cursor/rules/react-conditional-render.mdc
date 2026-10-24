---
description: Prefer && for nullable object conditionals in JSX; use ternary only when the condition can be 0 or NaN.
alwaysApply: true
globs: "**/*.{tsx,jsx}"
---

# React conditional render

When the condition is a nullable object (or another value that is never `0` / `NaN`), prefer `&&` over `? … : null`:

```tsx
{pendingDelete && <DeleteCvConfirmModal … />}
```

Not:

```tsx
{pendingDelete ? <DeleteCvConfirmModal … /> : null}
```

Use a ternary when the left side can be a falsy number (`0`, `NaN`) that must not render as text.
