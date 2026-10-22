# 07: Experiences section

**What to build:** The user can add, edit, save, delete, and reorder work experience entries. Each entry uses the shared form pattern (Save/Cancel/dirty guard). Dates are month/year; current role hides end date. Saved experiences render in the Canadian preview.

**Blocked by:** 06 — Form pattern + TipTap + Header

**Status:** ready-for-agent

**Maps to:** US-06

- [ ] Fields: job title, company, location, start month/year, end month/year or current-position flag, description (TipTap HTML)
- [ ] Current position disables/hides end date; preview shows Present/Présent based on CV locale
- [ ] User can add multiple experiences; delete removes after appropriate confirmation if destructive
- [ ] Items within the section are reorderable
- [ ] Save/Cancel/dirty guard match the header pattern
- [ ] Preview lists saved experiences in item order
