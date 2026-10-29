# 11: Section reorder

**What to build:** The user can reorder all non-header sections (Experiences, Education, Languages, and each custom section) using drag-and-drop and a position selector. Header stays first. The new order persists to IndexedDB immediately and updates the preview.

**Blocked by:** 07 — Experiences section; 08 — Education section; 09 — Languages section; 10 — Custom sections

**Status:** resolved

**Maps to:** US-10

- [x] Header cannot be moved from the first position
- [x] Drag-and-drop (@dnd-kit) reorders eligible sections
- [x] Position selector can move a section to a chosen slot among eligible sections
- [x] Order is written to IndexedDB immediately (no per-block Save required for order-only changes)
- [x] Preview section order matches persisted order after reorder
