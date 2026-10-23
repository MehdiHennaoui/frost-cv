# Print-based PDF export on US Letter

Canadian CVs are laid out for **US Letter** paper (8.5 × 11 in), the North American default—not A4. V1 exports PDF by printing the Tailwind Canadian preview in the browser (`@page` / print CSS sized to Letter), instead of a dedicated PDF library such as react-pdf. That keeps preview and export the same document and avoids a second layout engine; the trade-off is less pixel-perfect control and no server-side PDF generation. A4 or alternate engines can come later if needed.
