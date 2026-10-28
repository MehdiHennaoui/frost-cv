# 09: Languages section

**What to build:** The user can add, edit, delete, and reorder language entries. Each entry has a language name and a free-text level (not a fixed enum). Edits use the shared autosave pattern. Persisted languages appear in the preview.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** resolved

**Maps to:** US-08

- [x] Fields: language name, level as plain text input
- [x] CRUD + item reorder within the section
- [x] Autosave / flush behavior matches the shared form pattern
- [x] Preview lists persisted languages in item order
- [x] No TipTap required for this section
