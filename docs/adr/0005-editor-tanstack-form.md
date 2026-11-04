---
status: accepted
---

# Editor field state is one TanStack Form

The CV editor keeps every field in a single TanStack Form. Autosave reads that form's values and writes the whole CV through one `createAutosave` chain. The CV preview and export show the last successful save only. The persisted CV shape does not change. Opening a CV or replacing it from import remounts the form so its default values match the stored document.

## Considered options

Controlled form state won over an uncontrolled native form read through a DOM ref. A DOM read still needs a parallel store for TipTap, checkboxes, and reorder, which recreates the split this redesign removes. Per-section draft hooks that copy values into `persistedCv` on each save are the current approach and stay rejected. TipTap stays a controlled field (`value` / `onChange`), not a hidden input.

## Consequences

- Sections share that one form. There is no second draft store.
- IndexedDB `put` replaces the whole CV. The single autosave chain is what keeps two saves from clobbering each other. That chain is part of the test surface.
- List fields (experiences, education, languages, custom sections) are array fields. Reorder moves values in the form. React keys are entry ids, not indexes.
- Validation is the full editor Zod schema on `useForm` (form-level `onChange`), not per-input field validators and not a second Zod parse inside autosave. That schema matches the stored content, including section-order constraints, and is stricter on months than the import/export schema: a month is empty or `YYYY-MM`, and an end month before the start is invalid unless the experience is current. Autosave skips `saveCv` when the form is invalid. The save reads the form at fire time, so a newer invalid edit is not replaced by an older valid snapshot.
- Zod issue paths still drive the field widgets' error UI. Field errors follow typing. The first skipped save of an invalid episode shows one error toast, `Could not save this CV. Fix the highlighted fields.` The toast does not repeat until the schema passes. `console.error` logs the Zod error on every skipped save.
- Add, delete, and reorder still update the form when the schema fails. Those edits reach IndexedDB only on the next valid save. The CV preview stays on the last success until then.
- A rejected `saveCv` is a separate failure: toast `Could not save this CV. Try again.` plus `console.error` of the exception. The form keeps its values.
- Create and duplicate modals stay unchanged in this work. Whether TanStack Form belongs on those simple submit forms is a later decision, not an endorsement.
