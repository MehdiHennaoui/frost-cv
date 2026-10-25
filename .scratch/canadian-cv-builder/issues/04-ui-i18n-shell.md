# 04: UI i18n shell

**What to build:** The user can switch the application UI between English and French. List, create, and delete flows use translated strings from i18next (English source, `fr` translations).

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** resolved

**Persistence:** `i18next-browser-languagedetector` with `localStorage` key `i18nextLng`. Missing values fall back to `en`.

**Maps to:** US-04

- [x] i18next + react-i18next are wired with `en` and `fr` resource files
- [x] User can switch UI language and see list/create/delete copy update
- [x] Preference persists across reload (e.g. localStorage) or clearly defaults then applies for the session — document which
- [x] Source strings in code/resources are English; French lives in translation files
