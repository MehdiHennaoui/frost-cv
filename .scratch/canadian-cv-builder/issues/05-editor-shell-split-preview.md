# 05: Editor shell + Canadian preview

**What to build:** Opening a CV shows an editor shell: edit UI in the app sidebar (injected via `createPortal`) and a Canadian-format preview of **saved** data in the main pane. Identity stays first in the section-order model; other sections are scaffolded even if their editors are still stubs.

**Blocked by:** 02 — Create CV modal

**Status:** resolved

**Layout (settled after UI feedback):** Shared chrome lives in `AppLayout` (locale switch, page `<h1>`, sidebar shell). `SidebarTrigger` and an open sidebar apply only on the CV editor route; leaving that route closes the sidebar. Edit forms are portaled into the sidebar host — not a page-local split or mobile Edit/Preview tabs.

**Maps to:** US-11 (partial)

- [x] Route loads a resume by id from IndexedDB (missing id → clear not-found UX)
- [x] Edit UI lives in the AppLayout sidebar (portal); preview is the main pane only
- [x] Sidebar opens on the editor route and closes when leaving; trigger only on that route
- [x] Preview renders from **persisted** resume data (not unsaved drafts)
- [x] Section order model exists with Identity fixed first; placeholder slots for experiences, education, languages, customs
