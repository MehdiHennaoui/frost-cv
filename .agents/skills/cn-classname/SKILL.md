---
name: cn-classname
description: >
  Conditional className uses cn from @/shared/lib/cn with a class object.
  Use when writing or editing className, Tailwind classes, or a ternary that
  adds classes only when a condition is true.
---

# Conditional className

Optional classes go through `cn` (`@/shared/lib/cn`) as an object:

```tsx
className={cn("relative", { "z-10": isDragging })}
```

A ternary stays when both branches are class strings:

```tsx
className={cn(isOpen ? "opacity-100" : "opacity-0")}
```
