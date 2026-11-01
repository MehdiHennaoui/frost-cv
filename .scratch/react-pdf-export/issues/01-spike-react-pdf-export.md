# 01: Spike React PDF export (preview = document)

**What to build:** On branch `prototype/react-pdf-export` (or `research/react-pdf-export`), prototype a **React PDF document** for Canadian CVs: on-screen preview and download are the same `@react-pdf/renderer` document on **Letter page**. Do not replace production Print PDF until ADR-0003 is accepted.

**Type:** prototype

**Blocked by:** None

**Status:** resolved

**Maps to:** US-12 (alternative to ticket 13 / ADR-0002); cites ADR-0003 (Accepted)

## Scope

- [x] Branch isolated; production Print PDF path untouched until a superseding ADR
- [x] Editor preview renders the React PDF document only (no Tailwind preview, no engine toggle)
- [x] Parallel control to download the React PDF document (Print PDF may stay as a second control if useful; not required for side-by-side Tailwind)
- [x] US Letter only; spacing/type scales from settled spike pre-decisions (pt / StyleSheet)
- [x] Same CV model: sections, `sectionOrder`, CV locale labels / Present–Présent
- [x] TipTap HTML → React PDF subset mapper (bold, italic, lists, links)
- [x] Visual reference = current Canadian layout (no redesign)
- [x] Go/no-go evidence against ADR-0003: download UX + Letter fidelity (human judgment after running the proto)

## Out of scope

- Superseding ADR-0002 in production
- US-15 page-count limits, A4, auth/cloud
- Changing autosave / Draft preview timing
- Full HTML/CSS parity with Tailwind

## Answer

**GO.** Letter-sized React PDF document is good enough to ship as the production preview/export path. ADR-0003 accepted; ADR-0002 superseded. Primary source for the rewrite: branch `prototype/react-pdf-export` (do not merge; rewrite cleanly from `main` on a future `feature/` branch). Production build spec: `.scratch/react-pdf-export/spec.md`.

## Comments

- Grill 2026-10-31: Q1 parallel download control; Q2/Q2b preview = React PDF only; Q3 TipTap subset mapper; Q4 download first + Letter mandatory; Q5 glossary + ADR-0003 Proposed + this issue.
- Prototype on `prototype/react-pdf-export`: editor preview = React PDF with viewer toolbar (page nav / download); no Export PDF sidebar button; Back to list is a top icon. Run `pnpm prototype:react-pdf`.
- Validated UX: page numbers / total only via PDFViewer `showToolbar` (preview chrome). Never draw page numbers into the Document/pages—downloaded PDF must stay clean. ADR-0003 accepted on that basis.
