# 03: Delete CV + confirm modal

**What to build:** From the list, the user can delete a CV. A confirmation modal must be accepted before the resume is removed from IndexedDB; the list updates afterward.

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** resolved

**Maps to:** US-03

- [x] Delete action opens a confirmation modal naming the CV (or equivalent clear context)
- [x] Confirm removes the resume from IndexedDB
- [x] Cancel / dismiss leaves the resume unchanged
- [x] List refreshes and no longer shows the deleted CV
