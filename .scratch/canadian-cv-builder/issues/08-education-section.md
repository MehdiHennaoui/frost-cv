# 08: Education section

**What to build:** The user can add, edit, delete, and reorder education entries (school, degree, start/end month-year, city/country) with the shared form pattern (1s debounced autosave + flush on blur/leave). Persisted entries appear in the preview. Certifications remain out of scope.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** claimed

**Maps to:** US-07

- [x] Fields: school name, degree name, start month/year, end month/year, city/country
- [x] Dates are month/year only
- [x] CRUD + item reorder within the section
- [x] Autosave / flush behavior matches the shared form pattern
- [x] Preview lists persisted education entries in item order
