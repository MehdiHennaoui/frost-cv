# 05: Editor shell + split preview

**What to build:** Opening a CV shows an editor shell: forms area + Canadian-format preview of saved data. Desktop uses a split layout; mobile uses Edit / Preview tabs. Header section is always shown first in the structure; other sections are scaffolded in a persisted order model even if some section editors are still stubs.

**Blocked by:** 02 — Create CV modal

**Status:** ready-for-agent

**Maps to:** US-11 (partial)

- [ ] Route loads a resume by id from IndexedDB (missing id → clear not-found UX)
- [ ] Desktop: split view with editor and preview side by side
- [ ] Mobile: Edit / Preview tabs
- [ ] Preview renders from **persisted** resume data (not unsaved drafts)
- [ ] Section order model exists with header fixed first; placeholder slots for experiences, education, languages, customs
