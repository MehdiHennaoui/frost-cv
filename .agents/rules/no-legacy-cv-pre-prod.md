---
description: No old-CV migration until prod; ask before each /implement whether this is the prod cut.
alwaysApply: true
---

# No legacy CV handling before prod

Until the user has confirmed the app is (or this change is) the **production** cut, do **not** add compatibility for older CV shapes (IndexedDB repair, legacy `sectionOrder` keys, dual-read schemas, soft migrations).

## Before every `/implement`

Ask once, before branching or coding:

> Is this implement targeting the production version (need old-CV compatibility), or still pre-prod (break/replace shapes freely)?

Wait for the answer. Pre-prod → trust writers; invalid data may fall back to defaults. Prod (or user says yes) → then design migration / dual-read as needed.

## Do

- Prefer rewriting create/update paths so persisted data stays consistent.
- Drop repair loops and “legacy key” branches when simplifying pre-prod code.

## Do not

- Invent migration for shapes that only existed in local/dev data unless the user asked for prod compatibility.
- Assume prod status from chat history; re-ask at each `/implement`.
