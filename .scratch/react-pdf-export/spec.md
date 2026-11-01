# React PDF document (production)

Status: ready-for-agent

## Problem Statement

Users need a reliable Letter-sized PDF of their Canadian CV that matches what they see while editing. Print PDF (browser print of the Tailwind preview) forces the system print dialog, gives weaker control over pagination and typography, and couples export to print CSS. After a validated spike, the product decision is to replace that path with a React PDF document so preview and download share one engine.

## Solution

In the CV editor, the preview is a React PDF document on Letter page (`@react-pdf/renderer` PDFViewer). The viewer toolbar provides page navigation and download. Page numbers appear only in that preview chrome—never drawn into the Document—so the downloaded file stays clean. Layout follows the existing Canadian reference: Identity and ordered Sections, CV locale labels (including Present / Présent), and TipTap rich text mapped to a bold/italic/lists/links subset. Print PDF is removed from production.

## User Stories

1. As a CV editor user, I want the preview to show a React PDF document of my current CV, so that what I see is what I download.
2. As a CV editor user, I want that document sized to Letter page, so that the PDF matches Canadian application norms (not A4).
3. As a CV editor user, I want the preview to update from the same CV model I edit (Sections, Entries, Custom Sections, section order, CV locale), so that I do not maintain a second layout source.
4. As a CV editor user, I want Identity (name, job title, contacts, links, summary) rendered at the top of the document, so that the Canadian masthead is preserved.
5. As a CV editor user, I want Experiences, Education, Languages, and Custom Sections to appear in my saved section order, so that reordering in the editor is reflected in the PDF.
6. As a CV editor user, I want Identity to stay first and non-reorderable in the document, so that the fixed section rule matches the editor.
7. As a CV editor user with an English CV locale, I want section labels and “Present” wording in English, so that the PDF matches that CV’s language.
8. As a CV editor user with a French CV locale, I want section labels and “Présent” wording in French, so that the PDF matches that CV’s language.
9. As a CV editor user, I want UI locale changes not to rewrite CV locale labels in the PDF, so that chrome language stays independent of document language.
10. As a CV editor user, I want experience and education date ranges (including ongoing / Present–Présent) to render like the Canadian reference, so that employment history reads correctly.
11. As a CV editor user, I want each Language entry (name + proficiency) to appear in the Languages section, so that skills are not dropped in export.
12. As a CV editor user, I want each Custom Section title and rich-text body to appear in order, so that free-form content survives export.
13. As a CV editor user, I want TipTap bold in descriptions to appear bold in the React PDF document, so that emphasis is preserved.
14. As a CV editor user, I want TipTap italic to appear italic in the React PDF document, so that emphasis is preserved.
15. As a CV editor user, I want TipTap bullet and ordered lists to appear as lists in the React PDF document, so that structured bullets survive export.
16. As a CV editor user, I want TipTap links to remain clickable/underlined links in the React PDF document, so that URLs stay usable in the PDF.
17. As a CV editor user, I want unsupported TipTap HTML to degrade safely (sanitized / omitted rather than crashing the preview), so that odd markup does not break export.
18. As a CV editor user, I want the PDFViewer toolbar visible (`showToolbar`), so that I can navigate multi-page previews and download without a separate export button.
19. As a CV editor user, I want page numbers / page total only in the viewer toolbar, so that the downloaded PDF has no page-number footer in its content.
20. As a CV editor user, I want download from the viewer toolbar to produce a Letter-sized PDF of the current document, so that I can attach it to applications.
21. As a CV editor user, I do not want a separate “Export PDF” sidebar button in this UX, so that download stays in one obvious place (the toolbar).
22. As a CV editor user, I want a Back-to-list control as an icon in the top sidebar alongside JSON export/import, so that navigation stays compact and familiar.
23. As a CV editor user, I want the Canadian visual reference preserved (typography hierarchy, section rules, spacing feel)—not a redesign—so that existing CVs still look like Frost CV.
24. As a CV editor user, I want type sizes to use paired fontSize + lineHeight tokens (Tailwind-like `text("sm"|…)`), so that body and headings stay consistent.
25. As a CV editor user, I want spacing to follow a 4 / 8 / 12… scale in the document styles, so that gaps feel even across sections.
26. As a Library user returning from the editor, I want Print PDF / browser print no longer to be the production export path, so that I am not pushed through the system print dialog for the primary PDF.
27. As a CV editor user with empty optional fields, I want empty contacts or empty sections to omit or show empty states without breaking layout, so that sparse CVs still preview cleanly.
28. As a CV editor user with many Entries, I want content to flow across multiple Letter pages via React PDF pagination, so that long CVs remain readable (no hard US-15 page cap in this work).
29. As a developer shipping this feature, I want production code rewritten cleanly from `main` on a `feature/` branch (prototype branch as primary source only), so that throwaway spike files are not promoted as-is.
30. As a maintainer, I want ADR-0003 / glossary language (React PDF document, Letter page, Print PDF as legacy) used in code and docs, so that the domain stays unambiguous.

## Implementation Decisions

- **Replace Print PDF in production** with a React PDF document (`@react-pdf/renderer`). Remove the browser-print production path when this ships. ADR-0003 accepted; ADR-0002 superseded.
- **Rewrite cleanly from `main`** on a future `feature/` branch. Branch `prototype/react-pdf-export` is the **primary source only** (validated UX and patterns)—do not merge that branch; do not promote prototype files as-is.
- **Editor preview** = PDFViewer rendering the React PDF document for the current CV on Letter page (`Page size="LETTER"`).
- **Toolbar UX**: PDFViewer `showToolbar` for page navigation and download. No separate Export PDF sidebar button in the validated UX. Back to list = top sidebar icon next to JSON export / import.
- **No in-PDF page chrome**: never draw page numbers or “page X of Y” into Document/Page content. Toolbar-only.
- **CV model drives the document**: Identity, Sections / Entries / Custom Sections, `sectionOrder`, CV locale labels (Present / Présent). Canadian layout reference; no redesign.
- **TipTap → React PDF subset mapper**: bold, italic, lists, links (after existing HTML sanitize). Unsupported nodes degrade safely.
- **Type and space tokens**: keep a `text(size)` helper that pairs fontSize + lineHeight (Tailwind-like), and a 4 / 8 / 12… spacing scale in StyleSheet. Prototype snippet encoding the type decision (`prototype/react-pdf-export`):

```ts
const TEXT = {
  xs: { fontSize: 9, lineHeight: 16 / 12 },
  sm: { fontSize: 10.5, lineHeight: 20 / 14 },
  base: { fontSize: 12, lineHeight: 24 / 16 },
  "2xl": { fontSize: 18, lineHeight: 32 / 24 },
} as const;

export function text(size: keyof typeof TEXT) {
  return TEXT[size];
}
```

- **FSD placement TBD** at ticket time; keep public APIs clean (cross-slice imports via slice `index.ts` only). Prefer scaffolding with `pnpm fsd` when new slices/segments are needed.
- **shadcn only** for product UI outside `src/shared/ui` (no direct `@base-ui/react` in app/pages/features/entities).
- **English only** for repo artifacts and default UI copy.
- **Pre-prod**: no legacy CV shape migrations unless /implement targets production compatibility.
- **Dependencies**: add/use `@react-pdf/renderer` in the production graph as required by the rewrite (spike already validated the library).

## Testing Decisions

Good tests assert externally visible behavior at the highest seams—not StyleSheet internals, private mappers in isolation unless they are the only practical seam, or fragile file-path structure.

Agreed external seams (primary):

1. **Editor route / preview**: opening the editor for a CV shows a React PDF Letter document preview driven by that CV (not the legacy Tailwind print preview as the production preview).
2. **Viewer toolbar vs file content**: toolbar provides page navigation; a downloaded PDF has **no** page-number footer (or equivalent page chrome) in document content / bytes when that is testable.
3. **CV model → document**: sections, section order, CV locale labels (Present / Présent), and the TipTap subset (bold/italic/lists/links) appear in the React PDF document for representative CV fixtures.

Prefer integration-style checks at those seams (editor preview behavior; render/download of Letter PDF; fixture-driven document content). Unit-test the TipTap→React PDF mapper only if higher seams cannot assert rich-text survival cheaply. Prior art: existing CV editor / entity CV tests and any PDF/preview fixtures already in the repo; extend rather than invent a parallel harness.

## Out of Scope

- Hard maximum page count (US-15)
- A4 or alternate paper sizes
- Auth, cloud sync, or server-side PDF generation
- Autosave / Draft timing changes
- Full HTML/CSS parity with the old Tailwind preview
- Redesign of the Canadian layout
- Merging `prototype/react-pdf-export` into `main`
- Promoting prototype files unchanged into production paths
- Separate Export PDF sidebar button (validated UX uses toolbar download)
- Drawing page numbers into the PDF Document

## Further Notes

- Domain terms: **React PDF document**, **Letter page**, **Print PDF** (legacy), **CV locale**, **section order**, **Identity**, **Custom Section**—see root `GLOSSARY.md`.
- Spike issue `.scratch/react-pdf-export/issues/01-spike-react-pdf-export.md` is **resolved** (GO); ADR-0003 accepted.
- Next process step after this spec: `/to-tickets` (not run here)—break into implementation tickets on a `feature/` branch from `main`, using the prototype branch as reference only.
