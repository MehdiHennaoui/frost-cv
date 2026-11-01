---
status: superseded
superseded-by: 0003-consider-react-pdf-export
---

# Print-based PDF export on US Letter

**Status:** Superseded by [ADR-0003](./0003-consider-react-pdf-export.md) (React PDF document).

Canadian CVs are laid out for **US Letter** paper (8.5 × 11 in), the North American default—not A4. V1 originally exported PDF by printing the Tailwind Canadian preview in the browser (`@page` / print CSS sized to Letter), instead of a dedicated PDF library such as react-pdf. That kept preview and export the same document and avoided a second layout engine; the trade-off was less pixel-perfect control and no server-side PDF generation.

Production export and preview now use a **React PDF document** (ADR-0003). Keep this ADR only as historical context for why Print PDF existed.
