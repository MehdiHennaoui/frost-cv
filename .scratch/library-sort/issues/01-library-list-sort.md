# 01: Library list sort

**What to build:** Let the user control how CVs are ordered on the Library list (criteria and direction TBD). Today the list is fixed to `updatedAt` descending via `listCvs`. Library export order follows the list order, so a future sort UI would also affect export ordering.

**Blocked by:** None (can start once triaged). Independent of `library-export-import` implementation, but product-wise export should keep following whatever order the list uses.

**Status:** needs-triage

**Maps to:** Deferred from library-export-import grill (Q20); out of scope there.

- [ ] Sorting criteria and defaults are decided (needs human triage)
- [ ] Library list order is user-controllable per that decision
- [ ] Order remains the source of truth for Library export `cvs` sequence
