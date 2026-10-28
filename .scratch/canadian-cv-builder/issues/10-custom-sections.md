# 10: Custom sections

**What to build:** The user can add custom sections, each with a title and TipTap description. Each custom section is a **top-level** entry in the global section order (same level as Experiences / Education / Languages), not nested under a single “Custom” bucket. Edits use the shared autosave pattern (1s debounce + flush on blur/leave) per custom section.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** resolved

**Maps to:** US-09

- [x] User can create multiple custom sections (title + description HTML)
- [x] Each custom section appears as its own top-level section in the order model
- [x] User can delete a custom section (with confirmation if destructive)
- [x] Autosave / flush behavior matches the shared form pattern
- [x] Preview renders each persisted custom section with its title and HTML body
