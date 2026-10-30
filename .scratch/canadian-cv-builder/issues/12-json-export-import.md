# 12: JSON export + import

**What to build:** The user can download the current CV as a JSON file and import a JSON file to create a new CV or replace an existing one after confirmation. Schema covers the full v1 resume shape (header, experiences, education, languages, customs, section order, title, locale). Export stays available from the editor and is also offered from each CV card on the list (same single-CV JSON), so a backup does not require opening the editor.

**Blocked by:** 10 — Custom sections

**Status:** claimed

**Maps to:** US-13, US-14

- [x] Export downloads a JSON file representing the saved resume (including schema/version marker if used)
- [x] Import validates/parses JSON and fails gracefully on invalid files
- [x] Import can create a new CV in IndexedDB
- [x] Import can replace an existing CV only after explicit confirmation
- [x] Round-trip export → import preserves user-visible content and section order
- [x] Export from each CV card on the list downloads the same single-CV JSON as the editor export (keep editor export)

## Comments

- Reopened after initial resolve: add list-card export so users avoid an extra navigation into the editor. Library export/import (export all, add vs replace) stays a separate follow-up ticket, not this checklist item.
