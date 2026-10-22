---
description: Write code, comments, docs, and UI copy in English unless the user asks otherwise.
alwaysApply: true
---

# English only (default)

Use **English** for everything you write in this project, unless the user explicitly asks for another language:

- Source code identifiers (variables, functions, types, files, commits when you draft them)
- Comments and JSDoc
- Docs (`README`, ADRs, skill notes you author here)
- UI copy on pages, buttons, titles, error messages, aria labels
- Test names and fixture labels
- Agent replies in chat about code changes can follow the user’s language; **repo artifacts stay English**

## Exceptions

- Only switch language when the user clearly requests it for that artifact.
- If the app has i18n / translations: keep source strings and default locale in English; put other languages in translation files. Never hardcode French (or other) UI in components as the primary copy unless asked.

## Do not

- Mix languages in the same file without a clear i18n boundary.
- Leave French comments or README sections after an English-only request.
