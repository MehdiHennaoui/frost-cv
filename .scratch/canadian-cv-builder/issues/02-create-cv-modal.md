# 02: Create CV modal

**What to build:** From the list page, the user clicks Create, fills a modal with title and CV language (required), confirms, and is taken to the editor route for the newly persisted CV.

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** resolved

**Maps to:** US-02

- [x] Create button opens a modal requiring title and locale
- [x] Submitting creates a resume in IndexedDB with sensible empty section defaults
- [x] User is navigated to the editor for that resume id
- [x] New CV appears on the list after navigating back (updatedAt set)
- [x] Cancel / dismiss does not create a resume
