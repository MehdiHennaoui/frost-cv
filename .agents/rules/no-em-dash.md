---
description: Never use em dashes in product UI; use a comma instead.
alwaysApply: true
---

# No em dash in product UI

Do not use the Unicode em dash (`—`) in product-facing copy.

## Do

- Prefer a **comma** wherever you would have used an em dash (joins, asides, error sentences).
- Apply in i18n strings (`en` / `fr`), CV preview layout labels, buttons, toasts, aria labels, and empty states.

## Examples

- Entry heading: `Engineer, Acme, Montreal` (not `Engineer, Acme — Montreal`)
- Language row: `French, B2` (not `French — B2`)
- Toast aside: `Could not import “X”. It does not match the CV schema.` (not `… — it does not…`)

## Do not

- Use `—` in new or edited product UI copy.
- “Fix” em dashes inside ADRs, research notes, or code comments unless the user asked for a docs pass.
