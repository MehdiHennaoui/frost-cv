# 03: Delete CV + confirm modal

**What to build:** From the list, the user can delete a CV. A confirmation modal must be accepted before the resume is removed from IndexedDB; the list updates afterward.

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** ready-for-agent

**Maps to:** US-03

- [ ] Delete action opens a confirmation modal naming the CV (or equivalent clear context)
- [ ] Confirm removes the resume from IndexedDB
- [ ] Cancel / dismiss leaves the resume unchanged
- [ ] List refreshes and no longer shows the deleted CV
