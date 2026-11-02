# Editor collapse + Go to

Editor UX so long CVs are scannable: collapsible entries, section bulk toggle, and a Go to command palette with hash deep links.

## Decisions (grilled)

### Collapse

- List sections only (Experiences, Education, Languages). Identity and Custom Sections have no entries.
- Each entry is collapsible; default on editor open = all collapsed.
- Collapse control leftmost; truncated label uses remaining width. Position menu, drag handle, and delete keep their current places.
- Collapsed label: `{n} · {derived}` (1-based order). Derived:
  - Experiences: `jobTitle` · `company` (omit empty parts)
  - Education: `degree` · `school`
  - Languages: `language`
  - If derived empty after trim: section display name (i18n), e.g. `1 · Experiences`
- Label source: live `entries` from `useCvEntryList` (no separate persisted-only snapshot).
- Section CardHeader control: if any entry in that section is expanded → collapse all; else → expand all. No indeterminate control.
- Collapse state is session-only (not stored on the CV). Reload → all collapsed again, except hash behavior below.

### Go to

- Command palette via shadcn `Command` (cmdk) in `@/shared/ui`.
- Open from sidebar header **Go to** button and ⌘K / Ctrl+K.
- Targets: Identity, every section in order (including Custom Sections), and entries nested under list sections (same labels as collapsed headers).
- Anchors use existing stable ids (built-in section keys, entry UUIDs, custom section ids) — not slugify(title).
- URL hash syncs to the target. On Go to / load with an entry hash: expand that entry only; do not manage other entries’ collapse state. Section hash: scroll only.

## Out of scope

- Persisting collapse state on the CV / IndexedDB
- Slug-based anchors
- Collapsing Identity or Custom Section bodies
- Full command palette beyond Go to targets
