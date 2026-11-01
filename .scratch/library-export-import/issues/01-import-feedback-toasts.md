# 01: Import feedback via toasts

**What to build:** Introduce shadcn toast notifications for the app. Migrate single-CV import failure feedback from inline dialog alerts to toasts, and show a success toast after a successful single-CV create import (list) and replace import (editor). Establishes the feedback rule used by Library import in later tickets.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Maps to:** `.scratch/library-export-import/spec.md` (US feedback / Q13–Q14)

- [ ] Toast primitive is available from `@/shared/ui` (shadcn) and mounted in app chrome
- [ ] List Import JSON (create) shows errors as toasts; no inline error paragraph in the modal
- [ ] Editor replace-import shows errors as toasts; no inline error paragraph in the dialog
- [ ] Successful create import and successful replace import each show a success toast
- [ ] Existing invalid JSON / unsupported version / invalid schema / import failed copy still reaches the user via toast
