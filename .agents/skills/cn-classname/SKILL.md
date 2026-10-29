---
name: cn-classname
description: >
  Conditional className uses cn from @/shared/lib/cn with &&.
  Use when writing or editing className, Tailwind classes, or a ternary that
  adds classes only when a condition is true.
---

# Conditional className

Optional classes go through `cn` (`@/shared/lib/cn`) and `&&`:

```tsx
className={cn("relative", isDragging && "z-10")}
```

A ternary stays when both branches are class strings:

```tsx
className={cn(isOpen ? "opacity-100" : "opacity-0")}
```
