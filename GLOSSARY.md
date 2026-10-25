# Frost CV

Domain language for the Canadian CV builder: local documents the user creates, edits, previews, and exports in the browser.

## Language

**CV**:
A single résumé document the user creates, edits, stores locally, and can export. It has a title, a CV locale, ordered sections, and saved content.
_Avoid_: Resume, curriculum, document (when meaning this entity)

**UI locale**:
The language of the application chrome (`en` or `fr`). Independent of any CV’s content language.
_Avoid_: Language (alone), app language (prefer this term)

**CV locale**:
The language used for that CV’s content labels and PDF/print wording (for example Present / Présent). Independent of the UI locale.
_Avoid_: Language (alone), CV language (prefer this term)

**Language entry**:
One row in the Languages section: a language name plus a free-text proficiency level.
_Avoid_: Language (alone), locale

**Identity**:
The fixed first section of a CV: person name, job title, contact details, profile links, and summary description. Not reorderable. Named Identity to avoid confusion with the HTML `<header>` element.
_Avoid_: Header, masthead, profile (when meaning this section)

**Section**:
A top-level region of a CV in the global order (Identity, Experiences, Education, Languages, or a Custom Section). Identity is a section but is not reorderable.
_Avoid_: Block, category, panel

**Entry**:
One item inside a multi-item section (one experience, one education row, or one language entry).
_Avoid_: Block, item (when naming the domain concept), record

**Custom Section**:
A user-defined top-level section with a title and a rich-text description. It participates in global section order like Experiences or Education; it is not an entry nested under a single “Custom” bucket.
_Avoid_: Custom block, free section

**Education**:
The section for school and degree history. UI copy may say “Formation” in French; the domain term stays Education.
_Avoid_: Certification (distinct, out of v1), Formation (UI-only synonym)

**Draft**:
Unsaved values in an open form. Not a separate CV; only an explicit save writes draft values into local storage.
_Avoid_: Autosave, temporary CV, scratch CV

**Import**:
Loading a CV from a JSON file into local storage. The operation is all-or-nothing: invalid or unsupported files make no change to stored CVs.
_Avoid_: Partial import, merge import (unless a future decision defines merge)

**Letter page**:
The print and preview page size for a Canadian CV: US Letter, 8.5 × 11 inches. Not A4.
_Avoid_: A4 (unless a future export mode targets international applications)
