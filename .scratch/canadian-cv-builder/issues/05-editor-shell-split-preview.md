# 05: Editor shell + split preview

**What to build:** Opening a CV shows an editor shell: forms area + Canadian-format preview of saved data. Desktop uses a split layout; mobile uses Edit / Preview tabs. Header section is always shown first in the structure; other sections are scaffolded in a persisted order model even if some section editors are still stubs.

**Blocked by:** 02 — Create CV modal

**Status:** resolved

**Maps to:** US-11 (partial)

- [x] Route loads a resume by id from IndexedDB (missing id → clear not-found UX)
- [x] Desktop: split view with editor and preview side by side
- [x] Mobile: Edit / Preview tabs
- [x] Preview renders from **persisted** resume data (not unsaved drafts)
- [x] Section order model exists with header fixed first; placeholder slots for experiences, education, languages, customs
