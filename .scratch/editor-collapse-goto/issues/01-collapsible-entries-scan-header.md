# 01: Collapsible entries with scan header

**What to build:** In the CV editor sidebar, each entry under Experiences, Education, and Languages can collapse to a one-line scan header. On editor open, every entry starts collapsed. The header shows a left-side collapse control and a single truncated line `{n} · {label}` derived from the live entry list state; position menu, drag handle, and delete stay where they are today. Collapse state is session-only.

**Blocked by:** None (can start immediately).

**Status:** resolved

**Maps to:** `.scratch/editor-collapse-goto/spec.md` (Collapse)

- [x] Experiences, Education, and Languages entries each have a collapse control on the far left of the entry chrome
- [x] Collapsed header shows one truncated line: 1-based order, middle dot, then derived label (Experiences: jobTitle · company; Education: degree · school; Languages: language); empty derived label falls back to the section display name
- [x] Position menu, drag handle, and delete keep their current placement; only the collapse control + label occupy the flexible left/width area
- [x] Opening the editor with no entry hash leaves all entries collapsed
- [x] Expanding/collapsing an entry is session-only (reload resets to all collapsed unless a later ticket’s hash behavior applies)
- [x] Collapsed labels update from the same live `entries` state used by the forms (no extra persisted-only title store)
