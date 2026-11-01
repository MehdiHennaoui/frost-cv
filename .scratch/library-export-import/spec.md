# Library export / import

Status: ready-for-agent

## Problem Statement

Users can already export and import one CV as JSON (list card / list create import / editor replace). They cannot back up or restore several Library CVs in one step, nor choose add vs wipe-and-replace when restoring a multi-CV file. Issue 12 left Library export/import as an explicit follow-up.

## Solution

On the Library list, the user can Library-export every CV or a checkbox selection into one JSON backup file, and Library-import that file with **add** (append new CVs) or **replace** (clear the library, then load) after a destructive confirmation for replace. Single-CV export/import paths stay as they are. All import errors and import successes use toasts (including migrating today’s inline dialog errors).

## User Stories

1. As a Library user, I want checkboxes on each CV plus select-all, so that I can choose what to export.
2. As a Library user, I want Export all, so that I can download every CV in one library JSON file without selecting each card.
3. As a Library user, I want Export selected (enabled only when at least one CV is checked), so that I can back up a subset.
4. As a Library user, I want Export all disabled when the library is empty and Export selected disabled when nothing is checked, so that empty downloads never start.
5. As a Library user, I want library export to read only persisted storage (not open Drafts), so that the file matches saved CVs.
6. As a Library user, I want the downloaded file named `frost-cv-library.json`, so that backups are easy to recognize.
7. As a Library user, I want `cvs` in the file to follow the current Library list order (`updatedAt` descending), including for a selection (list order, not click order).
8. As a Library user, after a successful library export, I want all checkboxes cleared, so that the next selection starts clean.
9. As a Library user, I want a dedicated Import library action (separate from single-CV Import JSON), so that I do not confuse the two file shapes.
10. As a Library user, I want to choose add or replace before picking the file, so that the mode is explicit.
11. As a Library user choosing replace, I want a destructive confirmation that all local CVs will be deleted, so that wipe-and-load is never accidental.
12. As a Library user choosing add, I want each CV in the file created as a new Library CV (new ids and timestamps), so that existing CVs stay untouched.
13. As a Library user choosing replace, I want the library cleared then loaded from the file in one all-or-nothing operation, so that I never end up half-restored.
14. As a Library user, I want an empty `cvs` array rejected, so that replace cannot wipe the library via an empty file.
15. As a Library user, if any CV in the file is invalid, I want the whole import to fail and a toast that names that CV’s title (or `CV #N` if title is missing), so that I know what to fix.
16. As a Library user, after add or replace succeeds, I want to stay on the Library list with a success toast, so that I see the new set without being pushed into an editor.
17. As a Library user, I want single-CV card export, list Import JSON (create), and editor replace-import to keep working beside library flows.
18. As a user of any import path, I want import failures and import successes shown as toasts (not inline dialog errors), so that feedback is consistent.

## Implementation Decisions

- Envelope: `{ schemaVersion: 1, cvs: CvExportDocument[] }` where each element is the existing single-CV export document (ADR-0004). Library `schemaVersion` is the envelope version; each CV keeps its own `schemaVersion`.
- Parse/validate the envelope first; then validate every CV; one failure aborts with no writes. Toast identifies the failing CV by `title`, else `CV #N` (1-based index in `cvs`).
- Filename for download: `frost-cv-library.json`.
- Export all / export selected serialize from IndexedDB (same source as list/preview), never in-memory Drafts.
- `cvs` order = current `listCvs` order; for selected export, filter to checked ids preserving that order.
- After successful export (all or selected), clear all selection checkboxes.
- Import library UI: mode add | replace → if replace, confirm wipe → file picker. Wrong shape (single-CV file) fails with a clear toast (unsupported / invalid schema).
- Add: create one new CV per entry (same spirit as `createCvFromImport`). Replace: clear library then create all entries in one all-or-nothing transaction (or equivalent seam that leaves storage unchanged on failure).
- Reject library files with zero CVs.
- Introduce app toast UI (shadcn); migrate existing single-CV import error (and add success) feedback from inline dialog alerts to toasts. Export library stays silent on success (browser download only).
- Keep per-card Export JSON, list Import JSON (create), and editor Replace CV import.
- Domain terms: **Library export**, **Library import**, **Library**, **Import** (`GLOSSARY.md`). Pre-prod: no legacy CV compatibility.

## Testing Decisions

- Assert external seams: parse/serialize library document; add import leaves existing CVs and appends new ones; replace wipes then loads; invalid envelope or any invalid CV writes nothing; empty `cvs` rejected; failing CV identity in the error path the UI uses for the toast.
- Repository (or equivalent persistence) tests for add/replace all-or-nothing; model tests for envelope validation.
- Toast wiring may be covered lightly where the project already tests import UI; prefer persistence + parse seams over deep dialog internals.

## Out of Scope

- Library list sorting / reorder UI (separate effort: `library-sort`)
- Merge-by-title or merge-by-id import
- Zip of many `.json` files
- Empty-file replace to wipe the library
- Changing single-CV export document shape beyond reuse inside `cvs`
- Cloud sync / multi-device conflicts
- Success toast on library export

## Further Notes

- Follow-up called out in `.scratch/canadian-cv-builder/issues/12-json-export-import.md`.
- Product US live in `.scratch/canadian-cv-builder/USER-STORIES.md` (US-17, US-18) and the toast consistency note under settled decisions.
- Suggested feature slug: `library-export-import` (this directory).
