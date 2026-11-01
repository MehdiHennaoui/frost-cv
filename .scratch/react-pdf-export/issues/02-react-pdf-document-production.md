# 02: React PDF document as production preview and export

**What to build:** In the CV editor, the user sees a Letter-sized React PDF document preview of their current CV (PDFViewer with toolbar for page navigation and download). Page numbers exist only in the toolbar chrome, never in the downloaded file. The document follows the Canadian layout: Identity, ordered Sections/Entries/Custom Sections, CV locale labels (Present / Présent), TipTap bold/italic/lists/links, and `text()` + spacing tokens. Print PDF is removed from production. Rewrite cleanly from `main` on a `feature/` branch; use `prototype/react-pdf-export` as primary source only—do not merge or promote prototype files as-is.

**Blocked by:** None (can start immediately). Spike `01` is resolved GO; ADR-0003 accepted.

**Status:** ready-for-agent

**Maps to:** `.scratch/react-pdf-export/spec.md`; US-12 / ADR-0003

- [ ] `@react-pdf/renderer` is available in the production dependency graph
- [ ] Editor preview shows a React PDF document on Letter page for the open CV (not Print PDF / Tailwind print preview as the production preview)
- [ ] PDFViewer toolbar is enabled for page navigation and download; no separate Export PDF sidebar button
- [ ] Downloaded PDF has no page-number footer (or equivalent page chrome) drawn into Document content
- [ ] Identity, Experiences, Education, Languages, and Custom Sections render in saved section order with CV locale labels / Present–Présent
- [ ] TipTap subset (bold, italic, lists, links) appears in identity summary, entry descriptions, and custom section bodies; unsupported markup degrades safely
- [ ] Type uses paired fontSize + lineHeight tokens (`text("sm"|…)`); spacing follows the 4 / 8 / 12… scale
- [ ] Back to list is a top sidebar icon alongside JSON export / import
- [ ] Print PDF production path is removed (`printCv` / print-only preview chrome and dead copy)
- [ ] Behaviour is covered at the agreed external seams (editor preview, toolbar vs file content, CV model → document) per the spec
- [ ] Implementation is a clean rewrite from `main` (prototype branch referenced, not merged)

## Comments

- `/to-tickets`: user chose a single merged ticket (shell + full sections/locale + TipTap + retire Print PDF) instead of 02–05 split.
