# 02: Library export (all + selected)

**What to build:** On the Library list, the user can select CVs with per-card checkboxes and select-all, then download a library JSON backup via Export all or Export selected. File shape is `{ schemaVersion: 1, cvs: [/* single-CV export docs */] }`, basename `frost-cv-library.json`. Export uses persisted list data only; selection clears after a successful download.

**Blocked by:** None (can start immediately). Toast ticket `01` is independent.

**Status:** resolved

**Maps to:** `.scratch/library-export-import/spec.md`; US-17; ADR-0004; `GLOSSARY.md` Library export

- [x] Library list shows per-CV checkboxes and a select-all / clear-all control
- [x] Export all downloads every CV when the library is non-empty; control disabled when empty
- [x] Export selected downloads only checked CVs; control disabled when none checked
- [x] Downloaded JSON matches the library envelope (`schemaVersion: 1`, `cvs` of valid single-CV documents)
- [x] Download basename is `frost-cv-library.json`
- [x] `cvs` order matches current `listCvs` order (`updatedAt` descending); selection preserves that order
- [x] Export reads persisted storage only (not Drafts)
- [x] After a successful export (all or selected), all checkboxes are cleared
- [x] Per-card single-CV Export JSON remains available
- [x] Serialize/parse (or serialize + round-trip) of the library document is covered at the entity/model seam
