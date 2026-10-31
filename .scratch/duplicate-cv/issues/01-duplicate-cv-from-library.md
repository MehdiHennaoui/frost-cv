# 01: Duplicate CV from Library

**What to build:** From the Library list, the user can Duplicate a CV. A modal reuses the Create form (title + CV locale) with Duplicate chrome, a suggested title (` (copy)` / ` (copie)` from UI locale), and the source CV locale. Confirm creates a new independent CV with a full content copy and opens it in the editor; cancel creates nothing; the original is unchanged.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Each Library CV card exposes a Duplicate action that opens the shared title + CV locale form with Duplicate framing
- [x] Defaults: title = source title + UI-locale copy suffix; CV locale = source locale; both editable
- [x] Confirm persists a new CV (new id, fresh timestamps, deep-copied content, modal title/locale) and navigates to its editor
- [x] Cancel / dismiss persists nothing; source CV unchanged after a successful Duplicate
- [x] Persistence seam `duplicateCv` (or equivalent) is covered by tests: happy path, invalid title, missing source, content independence from the original
