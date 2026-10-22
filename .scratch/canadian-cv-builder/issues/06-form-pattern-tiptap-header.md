# 06: Form pattern + TipTap + Header

**What to build:** The user can edit the CV header in a TanStack Form block (name fields, contacts, links, TipTap description), Save to IndexedDB, or Cancel. Leaving with unsaved changes shows Discard / Keep editing. Saved header data appears in the Canadian preview. This ticket establishes the reusable form + TipTap pattern for later sections.

**Blocked by:** 05 — Editor shell + split preview

**Status:** ready-for-agent

**Maps to:** US-05, US-11

- [ ] Header form fields: first name, last name, job title, email, phone, postal code, LinkedIn, GitHub, website, description (TipTap)
- [ ] TipTap core OSS only: bold, italic, bullet/numbered lists, links; content stored as HTML
- [ ] Save persists header to IndexedDB and refreshes preview
- [ ] Cancel resets the form to last saved values
- [ ] Dirty navigation/close attempt shows Discard / Keep editing modal
- [ ] Preview header reflects saved values only
