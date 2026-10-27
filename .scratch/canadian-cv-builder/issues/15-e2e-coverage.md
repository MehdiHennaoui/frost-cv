# 15: E2E coverage for core CV flows

**What to build:** Expand Playwright E2E beyond the smoke redirect and the experiences happy-path added with ticket 07, so each shipped editor section and list mutation has at least one browser-level tracer.

**Blocked by:** 07 — Experiences section (pattern exists under `e2e/`)

**Status:** ready-for-agent

**Scope:**

- Keep `pnpm test:e2e` / Playwright as the harness; reuse `playwright.config.ts` (Chromium + `pnpm dev`)
- Prefer role/label selectors and English default UI copy; avoid brittle CSS chains
- Cover flows that unit tests cannot prove end-to-end (IndexedDB persist, sidebar portal, preview lag after autosave flush)
- Do **not** re-test debounce timing or Zod internals in E2E; keep those in unit tests

**Maps to:** polish / regression safety across US-01–US-11

- [ ] List: create CV → appears on `/cvs` after navigating back
- [ ] List: delete CV with confirm removes it from the list
- [ ] Editor identity header: edit a field → preview updates after flush/blur
- [ ] Education / languages / custom sections: one happy-path each once those tickets ship (or stub tickets if still open)
- [ ] Document in `docs/agents/` when to add an E2E vs unit test (one short note is enough)
