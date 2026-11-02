# 02: Section expand/collapse all entries

**What to build:** Each list section (Experiences, Education, Languages) gains a control in its card header that expands or collapses every entry in that section in one click: if any entry is expanded, the control collapses all; otherwise it expands all.

**Blocked by:** 01 (Collapsible entries with scan header)

**Status:** resolved

**Maps to:** `.scratch/editor-collapse-goto/spec.md` (Collapse — section control)

- [x] Experiences, Education, and Languages card headers each expose one expand/collapse-all control
- [x] When at least one entry in that section is expanded, activating the control collapses every entry in that section
- [x] When every entry in that section is collapsed, activating the control expands every entry in that section
- [x] Identity and Custom Sections are unchanged (no entry list / no this control)
- [x] Per-entry collapse from ticket 01 still works alongside the section control
