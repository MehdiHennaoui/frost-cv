# 07: Experiences section

**What to build:** The user can add, edit, delete, and reorder work experience entries. Each entry uses the shared form pattern (1s debounced autosave + flush on blur/leave). Dates are month/year; current role hides end date. Persisted experiences render in the Canadian preview.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** ready-for-agent

**Maps to:** US-06

- [ ] Fields: job title, company, location, start month/year, end month/year or current-position flag, description (TipTap HTML)
- [ ] Current position disables/hides end date; preview shows Present/Présent based on CV locale
- [ ] User can add multiple experiences; delete removes after appropriate confirmation if destructive
- [ ] Items within the section are reorderable
- [ ] Autosave / flush behavior matches the header pattern
- [ ] Preview lists persisted experiences in item order
