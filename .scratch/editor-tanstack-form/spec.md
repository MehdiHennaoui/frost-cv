# Editor TanStack Form autosave

Status: ready-for-agent

## Problem Statement

Editing a CV today keeps Draft values in per-section React state (and sometimes a second TanStack Form on Identity) while the CV preview and export read a separate persisted CV updated after autosave. That split causes sync bugs, remount surprises after replace-import, and overlapping writers that can clobber a full-document IndexedDB put. Users need one clear place for field values, predictable save timing, visible validation, and a preview that always matches the last successful save.

## Solution

The CV editor owns one TanStack Form for all Sections and Entries. Field values live only in that form. Autosave reads the form, writes the whole CV through one save chain, and updates the CV preview and export only after a successful save. Validation is one form-level Zod schema on change. Invalid Drafts stay on screen with field errors; they do not overwrite storage. Structure edits still update the form immediately and persist on the next valid save. Visual layout of the editor stays as it is.

## User Stories

1. As a CV editor user, I want every field of my CV (Identity, Experiences, Education, Languages, Custom Sections) to share one form, so that typing in one Section does not fight another Section’s Draft.
2. As a CV editor user, I want my keystrokes to update the form immediately, so that what I see in inputs matches what will be saved.
3. As a CV editor user, I want rich-text descriptions (TipTap) to behave like other fields in that form, so that summary and experience text are not a special second store.
4. As a CV editor user, I want idle typing to become a Draft that saves after about 1s without further changes, so that I do not need an explicit Save button.
5. As a CV editor user, I want moving focus between fields or Sections inside the editor not to force an immediate save, so that hopping fields stays on the 1s debounce.
6. As a CV editor user, I want leaving the editor (blur out of the editor chrome or leaving the route) to flush pending Drafts immediately when valid, so that I do not lose work by navigating away.
7. As a CV editor user, I want adding an Entry or Custom Section to update the form and save immediately when valid, so that new rows are durable right away.
8. As a CV editor user, I want deleting an Entry or Custom Section to update the form and save immediately when valid, so that removals are durable right away.
9. As a CV editor user, I want reordering Sections or Entries to update the form order and save immediately when valid, so that layout changes are durable right away.
10. As a CV editor user, I want marking an experience as current to clear its end month and flush when valid, so that Present roles stay consistent.
11. As a CV editor user, I want the CV preview to show only the last successfully saved CV, so that on-screen Letter layout never races half-typed Drafts beyond the normal lag.
12. As a CV editor user, I want PDF export / download to use that same last successful save, so that what I download matches the preview source of truth.
13. As a CV editor user, I want preview and export lag after typing to stay within about 1s when the Draft is valid, so that the Canadian preview stays trustworthy.
14. As a CV editor user typing while a previous save is still in flight, I want later form values to win through one save chain, so that two full-document writes cannot silently overwrite each other out of order.
15. As a CV editor user, I want opening a CV to mount the form from the stored document, so that default values match what is in the Library.
16. As a CV editor user, I want replace-import of the current CV to remount the form from the new stored document, so that Drafts from the previous content do not stick.
17. As a CV editor user, I want React list keys for Entries to use stable Entry ids, so that reordering does not move TipTap or input state onto the wrong Entry.
18. As a CV editor user, I want month fields to accept empty or `YYYY-MM` only, so that invalid month strings never reach storage.
19. As a CV editor user, I want an end month before the start month to be invalid unless the role is current, so that date ranges stay ordered.
20. As a CV editor user, I want free-text fields (names, titles, links, language rows, Custom Section titles, rich text) to stay free strings without required-email or required-name rules, so that partial CVs remain editable.
21. As a CV editor user, I want Section order rules (Identity first, builtins present, Custom Section keys consistent) enforced by the same editor schema, so that a broken order cannot be saved.
22. As a CV editor user, I want validation to run on the whole form schema whenever values change, so that errors appear while I type without per-input Zod validators.
23. As a CV editor user, I want invalid fields to show field-level errors driven by schema issue paths, so that I know what to fix.
24. As a CV editor user, I want a malformed month to show a field error (not a silent save skip), so that I can correct format problems.
25. As a CV editor user, when a save is skipped because the form is invalid, I want one error toast for that invalid episode (`Could not save this CV. Fix the highlighted fields.`), so that I am told storage did not update without toast spam on every keystroke.
26. As a CV editor user, I want that toast not to repeat until the form becomes valid again, so that continuous invalid typing stays calm.
27. As a developer debugging skipped saves, I want `console.error` with the Zod failure on every skipped save, so that I can inspect schema issues in the console.
28. As a CV editor user with an invalid form, I want add / delete / reorder to still update what I see in the form, so that structure edits are not blocked by a bad month.
29. As a CV editor user with an invalid form, I want the CV preview to stay on the last successful save after those structure edits, so that Letter preview never shows invalid or unsaved structure.
30. As a CV editor user who then fixes validation, I want the next successful save to persist both the fixed fields and the pending structure changes, so that nothing I did on screen is dropped.
31. As a CV editor user, when IndexedDB rejects a save, I want a different error toast (`Could not save this CV. Try again.`) plus a console error of the exception, so that storage failures are distinct from validation.
32. As a CV editor user after a rejected save, I want my form values to remain, so that I can retry without retyping.
33. As a CV editor user after a rejected save, I want the CV preview to stay on the last successful save, so that export does not claim a write that failed.
34. As a CV editor user, I want the persisted CV document shape to stay the same as today, so that Library export/import and existing CVs keep working without a schema rewrite.
35. As a CV editor user, I want the editor UI layout, chrome, and controls to look and behave as before aside from save/validation behavior, so that this is a state-model change, not a redesign.
36. As a Library user creating or duplicating a CV, I want those modals to keep working unchanged in this effort, so that list flows are not blocked by the editor rewrite.
37. As a product owner, I want create/duplicate TanStack Form suitability left as a later question, so that this effort does not pretend those modals are endorsed by the new editor model.
38. As a CV editor user with French UI locale, I want validation and save-failure toasts translated, so that error feedback matches the UI locale.
39. As a CV editor user, I want go-to / hash targets and sidebar metadata that read the saved CV to keep using the last successful save, so that navigation still matches preview content, not unsaved Drafts.
40. As a CV editor user, I want save-pending chrome (disabled destructive actions while a save runs) to keep protecting me during in-flight writes, so that overlapping UI actions stay gated as today where that already exists.
41. As a CV editor user editing Experiences with TipTap, then reordering that Entry, I want the description HTML to stay on that Entry id, so that rich text does not jump to another row.
42. As a CV editor user who types a valid change then quickly makes it invalid before the debounce fires, I want the save that fires to see the latest form state and skip if invalid, so that an older valid snapshot cannot overwrite storage after I already broke the form.
43. As a CV editor user, I want Education month rules to match Experiences month rules (without a current-role exception on Education), so that formation dates stay consistent.
44. As a CV editor user, I want Languages and Custom Sections to participate in the same form and autosave rules, so that no Section keeps a private Draft hook.
45. As an implementer on pre-prod, I want to remove per-section Draft hooks and Identity’s standalone form without legacy dual-read, so that only the new model remains.

## Implementation Decisions

- Follow ADR-0005: one TanStack Form for the CV editor; autosave reads form values; one `createAutosave`-style chain serializes all editor `saveCv` writes; CV preview and export bind only to the last successful save; remount the form when opening a CV or after replace-import.
- Rejected: uncontrolled native form + DOM FormData ref context; per-section Draft hooks syncing into a shared persisted CV; TipTap mirrored through a hidden input; a second Zod parse inside autosave; a queue of snapshots / field-level merge.
- Form values mirror current CV content: Identity object, Experiences / Education / Languages arrays, Custom Sections array, Section order. Persist by writing the whole CV with bumped `updatedAt` as today. No new persisted schema version for this work.
- Editor Zod schema lives for the editor form: same structural rules as content used for export (including Section order constraints), plus stricter months (`""` or `YYYY-MM`; end-before-start invalid unless experience `isCurrent`). Do not reuse the import/export schema unchanged if it is looser on months.
- Wire that schema as form-level `onChange` validation on `useForm`. Field widgets read errors from Zod issue paths via TanStack field meta. Do not attach separate Zod validators on each input.
- Autosave schedule/flush: 1s idle debounce; flush on leaving the editor / unmount; immediate flush on add, delete, reorder, and current-role toggle (with end month cleared). Intra-editor focus moves stay on debounce.
- Before calling `saveCv`, require the form to be valid per that form state. Read values at fire time. On invalid: skip write; field errors already from onChange; one toast per invalid episode with English source `Could not save this CV. Fix the highlighted fields.`; `console.error` every skip with Zod detail; reset the toast episode when the form becomes valid again.
- On `saveCv` rejection: toast English source `Could not save this CV. Try again.`; `console.error` the exception; keep form values; do not advance the preview snapshot.
- Structure commands always mutate the TanStack form (array move/push/remove and Section order). Persistence of those mutations waits for a valid save.
- List fields use TanStack array field APIs for Entry order; React keys are Entry ids (and Custom Section ids), not indexes.
- TipTap remains controlled `value` / `onChange` into the form field.
- Remove `useCvSectionDraft` / `useCvEntryList` Draft ownership and Identity’s separate `useForm` once the single form owns values. Keep save-pending UX for in-flight writes where it already gates actions.
- Create and Duplicate modals: no changes in this effort.
- Pre-prod: break/replace editor state freely; no legacy Draft compatibility layer.
- UI copy and i18n: add en/fr strings for the two toasts; no em dashes in product copy.
- Domain language: Draft, CV preview, Section, Entry, Custom Section, Identity (`GLOSSARY.md`).

## Testing Decisions

- Good tests assert externally visible behavior only: user actions in, mocked `saveCv` calls (or absence), preview/export inputs reflecting last success, toasts, and form field values still present after failures. Do not assert TanStack internal store shape, private hook names, or IndexedDB call plumbing.
- Single automated seam: mounted CV editor (page / loaded shell) with `saveCv` mocked. Prefer this over new unit seams for Zod or the save chain in isolation.
- Cover at least: valid debounce (~1s) writes latest values once; leave/unmount flush; add/delete/reorder immediate save when valid; invalid month skips save, shows field error, one toast per episode, `console.error` on skip; structure change while invalid updates the form but not preview until a later valid save; overlapping saves serialize so latest valid wins; rejected `saveCv` shows the storage toast, keeps form values, leaves preview unchanged; replace-import remounts form to new content; Entry reorder keeps rich-text association by id (with TipTap mocked as today).
- Prior art: editor page tests for preview vs form and save-pending; section form autosave tests; shared autosave fake-timer guidance (`docs/agents/testing-autosave.md`); toast mocks used by import dialogs.
- Fake timers: same project pattern (fake timeout/interval after async setup; leave promises real; mock TipTap with a textarea).

## Out of Scope

- Changing Create / Duplicate modal implementation or removing TanStack Form from the package
- Uncontrolled native-form redesign
- New CV content schema / migration for production legacy shapes
- Visual redesign of the editor (layout, chrome, preview engine)
- Live keystroke preview
- Cloud sync, multi-tab CRDT, or field-level merge
- Making email or name required
- E2E expansion beyond what existing editor coverage already expects, unless needed to protect this seam
- Deciding whether TanStack Form stays on create/duplicate long term

## Further Notes

- ADR-0005 is the architectural record; this spec is the implementable acceptance surface.
- Glossary Draft and CV preview already describe the product behavior; keep code and tickets aligned with those terms.
- Feature slug: `editor-tanstack-form` (this directory).
- Follow-up (not this ticket): revisit whether TanStack Form is appropriate for the simple create/duplicate submit forms.
