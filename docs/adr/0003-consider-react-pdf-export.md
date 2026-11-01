---
status: accepted
---

# React PDF document for CV preview and export

**Status:** Accepted. Supersedes [ADR-0002](./0002-print-based-pdf-export.md) (Print PDF).

Production **Print PDF** (browser print of the Tailwind Canadian preview) is replaced by a **React PDF document** built with `@react-pdf/renderer` on **Letter page**.

## Decision

- Editor preview **is** the React PDF document (PDFViewer), sized to Letter page—not a separate Tailwind Letter preview.
- Page numbers / total appear **only** in the PDFViewer toolbar (`showToolbar`). Never draw page chrome into the Document/pages; downloaded PDF stays clean.
- Download PDF is via the viewer toolbar (validated UX has no separate Export PDF sidebar button).
- TipTap rich text maps to a React PDF subset (bold, italic, lists, links).
- Layout follows the existing Canadian reference: `sectionOrder`, CV locale labels, Present / Présent. Type via a `text("sm"|…)` helper (fontSize + lineHeight); spacing scale 4, 8, 12….
- Spike evidence lives on throwaway branch `prototype/react-pdf-export`. Production is a clean rewrite from `main` on a future `feature/` branch; do not promote prototype files as-is.

## Consequences

- ADR-0002 Print PDF is legacy; remove that production path when shipping this work.
- Preview and download share one layout engine (React PDF document), ending the print-dialog export path.
