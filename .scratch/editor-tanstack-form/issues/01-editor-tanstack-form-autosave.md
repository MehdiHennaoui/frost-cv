# 01: Editor TanStack Form autosave

**What to build:** The CV editor keeps every Section and Entry in one TanStack Form. Typing, leaving the editor, and add / delete / reorder (plus marking an experience current) turn Drafts into a full-document save through one save chain when the form is valid. The CV preview and export show only the last successful save. Opening a CV or replace-import remounts the form from storage. A form-level Zod schema validates on change (stricter months than import/export, plus Section order rules): invalid Drafts show field errors, skip `saveCv`, toast once per invalid episode, and log every skip; structure edits still update the form and land on the next valid save. A rejected save gets a distinct toast, keeps form values, and leaves the preview unchanged. Visual editor layout stays as today. Create and Duplicate modals are untouched.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] One TanStack Form owns all editor field values (Identity, Experiences, Education, Languages, Custom Sections, Section order); TipTap is a controlled field; Entry / Custom Section React keys use stable ids
- [x] Autosave reads form values at fire time through one save chain: ~1s idle debounce; flush on leave / unmount; immediate flush on add, delete, reorder, and current-role (end month cleared); intra-editor focus hops stay on debounce
- [x] CV preview and export bind only to the last successful save; form remounts on open and after replace-import; persisted CV shape unchanged
- [x] Form-level Zod `onChange` (not per-input validators, not a second parse in autosave): months empty or `YYYY-MM`; end before start invalid unless experience is current; Section order constraints; free text stays unconstrained; invalid → no `saveCv`, field errors from issue paths
- [x] Invalid episode: one toast `Could not save this CV. Fix the highlighted fields.` until the form is valid again; `console.error` on every skipped save; en/fr copy
- [x] While invalid, add / delete / reorder still update the form; preview stays on last success until the next valid save includes those structure edits
- [x] Rejected `saveCv`: toast `Could not save this CV. Try again.` plus `console.error`; form values kept; preview unchanged; en/fr copy
- [x] Per-section Draft hooks and Identity’s standalone form are removed; create/duplicate modals unchanged
- [x] Automated coverage on the mounted editor seam with mocked `saveCv` (debounce, leave flush, structure flush, invalid skip + toast episode, structure-while-invalid, save serialization, rejected save, remount after replace-import) per the feature spec
