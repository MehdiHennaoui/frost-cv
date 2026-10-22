# 02: Create CV modal

**What to build:** From the list page, the user clicks Create, fills a modal with title and CV language (required), confirms, and is taken to the editor route for the newly persisted CV.

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** ready-for-agent

**Maps to:** US-02

- [ ] Create button opens a modal requiring title and locale
- [ ] Submitting creates a resume in IndexedDB with sensible empty section defaults
- [ ] User is navigated to the editor for that resume id
- [ ] New CV appears on the list after navigating back (updatedAt set)
- [ ] Cancel / dismiss does not create a resume
