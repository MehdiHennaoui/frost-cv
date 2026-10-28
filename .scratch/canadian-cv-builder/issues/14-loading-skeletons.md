# 14: Loading skeletons

**What to build:** While a route loader is pending, the user sees shadcn `Skeleton` placeholders that approximate the destination layout, instead of a plain “Loading…” text line.

**Blocked by:** 05 — Editor shell + Canadian preview (shell exists so skeletons can mirror list / editor chrome)

**Status:** resolved

**Scope:**

- `/cvs` list pending → skeletons for the list (and any obvious list chrome), using `@/shared/ui/skeleton`
- `/cvs/$cvId` editor pending → skeletons that suggest sidebar + preview (or the main preview pane), without opening real edit forms
- Prefer existing shadcn `Skeleton`; do not invent a parallel loading system
- Keep copy accessible (e.g. `aria-busy` / visually hidden loading text where needed); do not leave only decorative pulses with no accessible name

**Maps to:** polish on US-01 / US-11 loading UX

- [x] List `pendingComponent` uses skeletons instead of (or in addition to a sr-only) plain loading paragraph
- [x] Editor `pendingComponent` uses skeletons that fit the AppLayout editor shell
- [x] No flash of wrong page title driven by a “not found” fallback while a valid CV is still loading (use a neutral pending title or leave title empty until loader data exists)
