# When to add E2E vs unit tests

## Unit (Vitest / jsdom)

- Debounce timing, Zod validation, field mappers, pure preview formatting
- Component behavior with mocked `saveCv` / TipTap stand-ins (see `testing-autosave.md`)

## E2E (Playwright, `e2e/`)

- Flows unit tests cannot prove: IndexedDB persist across navigations, sidebar portal wiring, preview lag after real blur/flush
- One happy-path tracer per shipped list mutation or editor section; prefer role/label + English UI copy
- Do **not** re-assert debounce ms or Zod edge cases in E2E
