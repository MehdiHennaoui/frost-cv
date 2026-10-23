# 01: Resume model + Dexie + list

**What to build:** A user opening the app sees a list of CVs stored in the browser (title, language, last updated), or an empty state when none exist. Under the hood, resumes live in IndexedDB via Dexie with a typed schema ready for later editor work.

**Blocked by:** None (can start immediately).

**Status:** resolved

**Maps to:** US-01

- [x] Dexie database exposes a `resumes` store with at least id, title, locale, content (or equivalent payload), createdAt, updatedAt
- [x] List page reads from IndexedDB and shows title, language, and updated time for each CV
- [x] Empty state is shown when there are no CVs
- [x] List is ordered by updatedAt descending
- [x] Behaviour is verifiable without create/delete UI (seed via a small test helper or one-off seed is acceptable)
