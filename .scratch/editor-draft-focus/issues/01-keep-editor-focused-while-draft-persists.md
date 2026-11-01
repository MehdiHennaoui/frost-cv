# 01: Keep the editor focused while a draft persists

**What to build:** While a draft is flushing to local storage, the user keeps typing in the focused field without losing focus or the caret. Reordering sections, adding a custom section, exporting, and importing stay unavailable until that persist finishes. A draft still flushes after 1s of idle typing, or immediately on blur / leaving the editor route. The replace-import dialog still blocks editing while it is open. The preview shows persisted content only.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] While a persist is in flight, the focused field keeps focus and the caret, and the user can continue typing
- [x] Section reorder, adding a custom section, export, and import stay unavailable until that persist finishes
- [x] The replace-import dialog still blocks editing the CV until it closes
- [x] A draft still flushes after 1s of idle typing, or immediately on blur / leaving the editor route
- [x] The preview shows persisted content only, and may lag the open draft by up to 1s
