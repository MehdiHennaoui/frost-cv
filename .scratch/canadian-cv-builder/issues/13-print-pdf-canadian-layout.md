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
