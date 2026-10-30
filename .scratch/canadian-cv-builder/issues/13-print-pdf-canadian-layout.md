# 13: Print / PDF Canadian layout

**What to build:** The user can export a PDF by printing the Canadian preview. Print styles (Tailwind + `@media print`) produce a clean Canadian-style layout: no photo, compact header with contacts/links, reverse-chronological content, section labels in the CV locale. No hard page-count limit.

**Blocked by:** 11 — Section reorder

**Status:** resolved

**Maps to:** US-12

- [x] User-facing control triggers browser print for the preview
- [x] Print stylesheet hides editor chrome and UI chrome; preview content is what prints
- [x] Layout follows settled Canadian rules (no photo; header contacts/links; section order respected)
- [x] Section labels / Present-Présent follow the CV locale, not necessarily the UI locale
- [x] No enforced max page count (length recommendation is backlog US-15)

### Visual polish

- [x] Editor sidebar: Export PDF, Export JSON, and Import are icon-only with tooltips; placed at the top
- [x] Editor sidebar: Back to list stays at the bottom with an icon plus the existing label text
- [x] Editor route desktop: sidebar takes half the page width; mobile sheet width unchanged
