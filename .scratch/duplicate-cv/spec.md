# Duplicate CV

Status: ready-for-agent

## Problem Statement

Users often need a second CV that starts from an existing one (another job, another language, a slight variant). Today they can only create an empty CV or import from a JSON file. There is no way to Duplicate a Library CV in place, so they either retype content or export/import by hand.

## Solution

From the Library list, the user can Duplicate any CV. A modal reuses the Create form (title + CV locale), prefilled with a suggested title and the source CV locale. On confirm, the app creates a new independent CV with a full content copy, then opens that CV in the editor. The original is unchanged.

## User Stories

1. As a Library user, I want a Duplicate action on each CV card, so that I can start a variant without leaving the list.
2. As a Library user, I want Duplicate to open a modal (not create silently), so that I can set the new title before anything is persisted.
3. As a Library user, I want that modal to use the same title and CV locale fields as Create, so that the flow feels familiar.
4. As a Library user, I want the modal chrome (dialog title and primary button) to say Duplicate, so that I do not confuse it with creating an empty CV.
5. As a Library user, I want the title field prefilled with the source title plus a “copy” suffix, so that I rarely start from a blank name.
6. As a Library user with English UI locale, I want that suffix to be ` (copy)`, so that the default title matches my UI language.
7. As a Library user with French UI locale, I want that suffix to be ` (copie)`, so that the default title matches my UI language.
8. As a Library user, I want the CV locale field prefilled from the source CV, so that language-specific copies start correct by default.
9. As a Library user, I want to change the CV locale in the Duplicate modal, so that I can fork a French CV into an English one (or the reverse) in one step.
10. As a Library user, I want to edit the suggested title before confirming, so that I can name the variant for a specific application.
11. As a Library user, I want Confirm to create a new independent CV, so that edits to the copy never change the original.
12. As a Library user, I want the new CV to get a new id and fresh created/updated timestamps, so that it is a first-class Library document.
13. As a Library user, I want the new CV’s content to be a full deep copy of the source (Identity, Experiences, Education, Languages, Custom Sections, section order, and all Entries), so that nothing is missing after Duplicate.
14. As a Library user, I want the new CV’s title and CV locale to come from the modal values (not forced from the source), so that my choices win at create time.
15. As a Library user, I want Cancel or dismiss of the modal to create nothing, so that exploring Duplicate is safe.
16. As a Library user, I want an empty or whitespace-only title to be rejected with the same validation as Create, so that I cannot persist a nameless CV.
17. As a Library user, after a successful Duplicate, I want to land in the editor for the new CV, so that I can start editing immediately.
18. As a Library user, after Duplicate, I want the new CV to appear in the Library when I return to the list, so that both original and copy are visible.
19. As a Library user, I want the original CV’s title, locale, content, and timestamps to stay unchanged after Duplicate, so that I keep my previous version intact.
20. As a Library user, I want Duplicate available only on the Library list in v1 (not in the editor), so that scope stays small.
21. As a Library user, if the source CV no longer exists when I confirm, I want a clear failure and no partial write, so that the Library stays consistent.
22. As a Library user, I want Export, Delete, and Duplicate to coexist on a card without removing existing actions, so that Duplicate extends the list rather than replacing a workflow.
23. As a Library user who Duplicates then edits only the copy, I want the original preview and export to stay as before, so that independence is real.
24. As a Library user who Duplicates a CV that has Custom Sections and a custom section order, I want those preserved on the copy, so that layout work is not lost.
25. As a Library user, I want Duplicate to work for both English and French CV locales already stored on the source, so that either kind of document can be forked.

## Implementation Decisions

- Add a persistence operation on the CV entity API, conceptually `duplicateCv`, that accepts a source CV id plus the same title/locale input shape used by Create (validated with the existing create input schema).
- On success, persist a new CV: new id, user-supplied title and locale, deep-copied content from the source as currently stored, fresh `createdAt` / `updatedAt`. Do not mutate the source row.
- If the source id is missing at confirm time, fail without writing a new CV.
- Reuse the Create modal form fields and validation (title + CV locale). Prefer one shared form/modal parameterized by mode (create vs duplicate) or equivalent thin wrapper; do not fork a second unrelated form.
- Duplicate mode: dialog title and primary action use Duplicate copy; default values are `{ sourceTitle + UI-locale suffix }` and `source.locale`.
- UI-locale suffix: English UI → ` (copy)`; French UI → ` (copie)`.
- Create mode behavior and empty-content defaults remain unchanged.
- Wire a Duplicate control on each Library list card; on success, reuse the existing post-create navigation (invalidate list, navigate to the new CV’s editor route).
- Expose `duplicateCv` through the CV entity public API like other repository operations.
- Content copy must be deep enough that later edits to nested Entries or Custom Sections on either CV do not affect the other (no shared mutable references across persisted documents).
- No schema migration: Duplicate writes the same CV shape already used by Create and Import.
- Pre-prod: no legacy CV compatibility work; trust current writers and shapes.
- Domain term: **Duplicate** (see `GLOSSARY.md`). Avoid naming the user-facing action Clone/Copy/Fork.

## Testing Decisions

- Good tests assert externally visible behavior of the persistence seam only: inputs in, Library state and returned CV out. Do not assert UI component internals, IndexedDB call shapes, or deep private helpers.
- Primary (and only planned) automated seam: CV persistence `duplicateCv` (or equivalent), in the same style as existing `createCv` / `createCvFromImport` repository tests.
- Cover at least: happy path (new id, copied content, chosen title/locale, source unchanged); title validation failure creates nothing; missing source fails and creates nothing; nested content independence after mutating one CV’s content in storage.
- Prior art: entity CV repository tests for create, delete, save, and import-as-new.
- No dedicated UI/component test suite required for v1; modal reuse is wiring on top of the tested seam and the existing Create form pattern.

## Out of Scope

- Duplicate action inside the CV editor
- Linked copies, templates, or live sync between original and duplicate
- Changing Duplicate defaults beyond title suffix + source locale
- Library export/import bulk flows
- Cloud sync or multi-device conflict handling
- Renaming or restructuring Create beyond what reuse for Duplicate needs
- Prod-era migrations or legacy CV shape repair

## Further Notes

- Glossary already defines **Duplicate**; keep implementation language aligned with it.
- Closest existing behavior is import-as-new (new id + provided content); Duplicate is the same idea with the content sourced from a Library CV and title/locale chosen in the Create-shaped modal.
- Suggested feature slug for tickets: `duplicate-cv` (this directory).
