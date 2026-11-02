# 03: Go to command palette with hash deep links

**What to build:** The editor sidebar header offers Go to (button + ⌘K / Ctrl+K) via a shadcn Command palette listing Identity, every section (including Custom Sections), and entries under list sections. Choosing a target scrolls to it, updates the URL hash using existing stable ids (not title slugs), and if the target is an entry, expands that entry only. Loading the editor with an entry hash does the same expand-for-target behavior.

**Blocked by:** 01 (Collapsible entries with scan header)

**Status:** ready-for-agent

**Maps to:** `.scratch/editor-collapse-goto/spec.md` (Go to)

- [ ] shadcn Command (cmdk) is available from `@/shared/ui` and used for Go to
- [ ] Sidebar header exposes a Go to control that opens the palette; ⌘K / Ctrl+K opens the same palette while in the editor
- [ ] Palette lists Identity, all sections in section order (customs included), and entries under Experiences / Education / Languages with the same `{n} · {label}` strings as collapsed headers
- [ ] Anchors / hashes use existing stable ids (built-in section keys, entry UUIDs, custom section ids) — not slugify(title)
- [ ] Choosing a target scrolls it into view in the sidebar and sets `location.hash` accordingly
- [ ] Choosing or loading an entry hash expands that entry only; other entries’ collapse state is left alone
- [ ] Choosing or loading a section hash scrolls to the section without requiring entries to expand
