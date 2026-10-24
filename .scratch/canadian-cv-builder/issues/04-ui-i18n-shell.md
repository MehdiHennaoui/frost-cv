# 04: UI i18n shell

**What to build:** The user can switch the application UI between English and French (Canada). List, create, and delete flows use translated strings from i18next (English source, `fr-CA` translations).

**Blocked by:** 01 — Resume model + Dexie + list

**Status:** resolved

**Persistence:** `localStorage` key `frost-cv.ui-locale`. Missing or unknown values default to `en`. The shell renders English first, then applies the stored locale after mount so server and client markup match.

**Maps to:** US-04

- [x] i18next + react-i18next are wired with `en` and `fr-CA` resource files
- [x] User can switch UI language and see list/create/delete copy update
- [x] Preference persists across reload (e.g. localStorage) or clearly defaults then applies for the session — document which
- [x] Source strings in code/resources are English; French lives in translation files
