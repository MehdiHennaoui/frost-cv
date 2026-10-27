# 06: Form pattern + TipTap + Header

**What to build:** The user can edit the CV header in a TanStack Form block (name fields, contacts, links, TipTap description). Changes autosave to IndexedDB after **1s** of idle typing, or flush immediately on blur / leaving the editor route. Persisted header data appears in the Canadian preview. This ticket establishes the reusable form + TipTap + autosave pattern for later sections. No Save / Cancel buttons; no dirty-guard modal.

**Blocked by:** 05 — Editor shell + split preview

**Status:** ready-for-agent

**Maps to:** US-05, US-11

- [ ] Header form fields: first name, last name, job title, email, phone, postal code, LinkedIn, GitHub, website, description (TipTap)
- [ ] TipTap core OSS only: bold, italic, bullet/numbered lists, links; content stored as HTML
- [ ] Debounced autosave (1s after last change) persists header to IndexedDB and refreshes preview
- [ ] Flush pending draft immediately on field/block blur and on leaving the editor route
- [ ] No Save / Cancel controls; no Discard / Keep editing modal
- [ ] Preview header reflects persisted values only (may lag the open draft by up to 1s until flush)
