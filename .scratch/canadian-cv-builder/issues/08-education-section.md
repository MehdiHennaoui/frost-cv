# 08: Education section

**What to build:** The user can add, edit, delete, and reorder education entries (school, degree, start/end month-year, city/country) with the shared form pattern (1s debounced autosave + flush on blur/leave). Persisted entries appear in the preview. Certifications remain out of scope.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** ready-for-agent

**Maps to:** US-07

- [ ] Fields: school name, degree name, start month/year, end month/year, city/country
- [ ] Dates are month/year only
- [ ] CRUD + item reorder within the section
- [ ] Autosave / flush behavior matches the shared form pattern
- [ ] Preview lists persisted education entries in item order
