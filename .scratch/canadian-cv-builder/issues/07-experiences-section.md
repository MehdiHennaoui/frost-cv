# 07: Experiences section

**What to build:** The user can add, edit, delete, and reorder work experience entries. Each entry uses the shared form pattern (1s debounced autosave + flush on blur/leave). Dates are month/year; current role hides end date. Persisted experiences render in the Canadian preview.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** resolved

**Maps to:** US-06

- [x] Fields: job title, company, location, start month/year, end month/year or current-position flag, description (TipTap HTML)
- [x] Current position disables/hides end date; preview shows Present/Présent based on CV locale
- [x] User can add multiple experiences; delete removes after appropriate confirmation if destructive
- [x] Items within the section are reorderable
- [x] Autosave / flush behavior matches the header pattern
- [x] Preview lists persisted experiences in item order
