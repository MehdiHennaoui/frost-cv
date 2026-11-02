# 03: Library import (add + replace)

**What to build:** On the Library list, a dedicated Import library flow: user picks **add** or **replace**, confirms wipe when replacing, then chooses a library JSON file. Add appends new CVs; replace clears the library then loads the file. All-or-nothing; empty `cvs` rejected; any invalid CV fails the whole import with a toast naming title or `CV #N`. Stay on the list; success and errors use toasts.

**Blocked by:** 01 — Import feedback via toasts; 02 — Library export (envelope + parse shared with export)

**Status:** resolved

**Maps to:** `.scratch/library-export-import/spec.md`; US-18; ADR-0004; `GLOSSARY.md` Library import / Import

- [x] List exposes Import library separate from single-CV Import JSON
- [x] User chooses add or replace before the file picker; replace requires destructive confirmation that all local CVs will be deleted
- [x] Add creates a new CV per file entry (new ids/timestamps); existing Library CVs unchanged
- [x] Replace clears the library then loads all file entries in one all-or-nothing operation
- [x] Empty `cvs` is rejected with no storage change
- [x] Invalid envelope, wrong file shape (e.g. single-CV doc), or any invalid CV writes nothing
- [x] Failure toast identifies the offending CV by title, or `CV #N` (1-based) when title is missing/blank
- [x] Success toast after add or replace; user remains on the Library list with refreshed data
- [x] Single-CV Import JSON (create) and editor replace-import remain available
- [x] Persistence seam covers add, replace, empty reject, and all-or-nothing failure (no partial writes)
