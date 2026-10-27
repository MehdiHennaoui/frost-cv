# 09: Languages section

**What to build:** The user can add, edit, delete, and reorder language entries. Each entry has a language name and a free-text level (not a fixed enum). Edits use the shared autosave pattern. Persisted languages appear in the preview.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** ready-for-agent

**Maps to:** US-08

- [ ] Fields: language name, level as plain text input
- [ ] CRUD + item reorder within the section
- [ ] Autosave / flush behavior matches the shared form pattern
- [ ] Preview lists persisted languages in item order
- [ ] No TipTap required for this section
