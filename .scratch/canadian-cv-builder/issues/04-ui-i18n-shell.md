# 04: UI i18n shell

**What to build:** The user can switch the application UI between English and French (Canada). List, create, and delete flows use translated strings from i18next (English source, `fr-CA` translations).

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** ready-for-agent

**Maps to:** US-04

- [ ] i18next + react-i18next are wired with `en` and `fr-CA` resource files
- [ ] User can switch UI language and see list/create/delete copy update
- [ ] Preference persists across reload (e.g. localStorage) or clearly defaults then applies for the session — document which
- [ ] Source strings in code/resources are English; French lives in translation files
