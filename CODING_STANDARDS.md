# Coding standards (review)

Read during **code review**, not as always-on implementation context. Mechanical rules belong in Biome / Steiger / Lefthook — do not duplicate them here.

## UI primitives

- Enforced by [shadcn-ui-only](.agents/rules/shadcn-ui-only.md) + Biome: product code uses `@/shared/ui/*` only; Base UI only inside those wrappers.
- Prefer shadcn composition (`Dialog` + `DialogContent` + `DialogHeader` / `Footer` / `Title`) over hand-rolled portal markup.
- Missing control → `pnpm dlx shadcn@latest add <component>` into `src/shared/ui/`, then import from `@/shared/ui`.
- Do **not** turn off Biome rules for all of `src/shared/ui/**`. For generated shadcn exceptions (e.g. sidebar cookie write), use a single-line `biome-ignore` on that line only.

## App shell

- Locale switch, page `<h1>`, and the sidebar shell live in `AppLayout`. Pages must not remount that chrome.
- Editor content enters the sidebar only through `SidebarPortal` / `createPortal` into the layout host.
- Page titles come from `ROUTE_PAGE_TITLE_KEYS` plus optional loader `pageTitle` — not React state or a `useEffect` that syncs a title into context.
- When UI feedback changes shell acceptance, update the issue (and settled decisions / US copy) before marking the ticket resolved. For review, the **current issue** wins over older USER-STORIES wording until those stories are amended.

## Control copy

- Button labels name the **action and object** (e.g. “Delete this CV”, “Create new CV”), not bare verbs (“Delete”, “Continue”). Follow [web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md) when reviewing copy.
- Icon-only controls need `aria-label`. Decorative icons next to visible text use `aria-hidden`.

## FSD public APIs

- Cross-slice imports go through each slice’s `index.ts` public API (e.g. `@/entities/cv`, `@/pages/cv-list`), not deep segment paths.
- New slices under `src/` are scaffolded with `pnpm fsd` and get a real public API when they export UI or model.
- Keep page-only UI (modals, local hooks) in `pages/<slice>` until a second consumer justifies a `features/` slice (`insignificant-slice`).

## List / router side effects

- Route files stay thin: load data, render the page. Invalidate / navigate after mutations live in page-local hooks (e.g. `useCvListNavigation`), not callback props from the route.

## Editor sections

- Section editors live under `src/pages/cv-editor/` (forms in `ui/`, helpers in `model/`).
- Debounced persist: `src/shared/lib/autosave.ts` (`createAutosave`). TipTap body height: `useResizableContentHeight` in `pages/cv-editor/model/`.
- Autosave / flush tests: follow [docs/agents/testing-autosave.md](docs/agents/testing-autosave.md).
- Section e2e tracers: follow [docs/agents/testing-e2e.md](docs/agents/testing-e2e.md) (retire skips in `e2e/sections-pending.spec.ts` when the real spec ships).
