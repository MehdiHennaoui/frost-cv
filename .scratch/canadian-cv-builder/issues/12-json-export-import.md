# 12: JSON export + import

**What to build:** The user can download the current CV as a JSON file and import a JSON file to create a new CV or replace an existing one after confirmation. Schema covers the full v1 resume shape (header, experiences, education, languages, customs, section order, title, locale).

**Blocked by:** 10 — Custom sections

**Status:** ready-for-agent

**Maps to:** US-13, US-14

- [ ] Export downloads a JSON file representing the saved resume (including schema/version marker if used)
- [ ] Import validates/parses JSON and fails gracefully on invalid files
- [ ] Import can create a new CV in IndexedDB
- [ ] Import can replace an existing CV only after explicit confirmation
- [ ] Round-trip export → import preserves user-visible content and section order
