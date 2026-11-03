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
The language used for that CV’s content labels and CV preview wording (for example Present / Présent). Independent of the UI locale.
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
Form values that have changed since the last successful persist. They flush to local storage after 1s of idle typing, or immediately on blur / leaving the editor route. Not a separate CV.
_Avoid_: Explicit save, temporary CV, scratch CV

**Library**:
The full set of CVs stored locally for the user. Not a separate document beyond that collection.
_Avoid_: Collection, vault, workspace, account (when meaning the set of CVs)

**Import**:
Loading CV data from a JSON file into local storage. Covers a single CV file or a library file. All-or-nothing: invalid or unsupported files make no change to stored CVs.
_Avoid_: Partial import, merge import (unless a future decision defines merge)

**Duplicate**:
Creating a new independent CV from an existing Library CV: full content copy, user-chosen title and CV locale, original unchanged.
_Avoid_: Clone, copy (when naming the action), fork, template instance

**Library export**:
Downloading one JSON backup file of the chosen CVs from the library, either every CV or a user selection.
_Avoid_: Bulk export, batch export (prefer Library export; UI may say “Export all” or “Export selected”)

**Library import**:
Loading a library JSON file into local storage. Two modes: **add** (create new CVs from the file) and **replace** (clear the library, then load the file). Still all-or-nothing.
_Avoid_: Bulk import, restore (say replace when the library is wiped), merge import

**Letter page**:
The page size for a CV preview and PDF: US Letter, 8.5 × 11 inches. Not A4. Applies to the CV preview (and historically to Print PDF).
_Avoid_: A4 (unless a future export mode targets international applications)

**Print PDF**:
Legacy export path: printing the on-screen Tailwind preview in the browser (print CSS / system print dialog) to produce a PDF. Superseded by the CV preview (ADR-0003; was ADR-0002).
_Avoid_: Browser PDF, print export (prefer this term), “the PDF” when the engine matters

**CV preview**:
The Letter-sized CV the user sees while editing and downloads as a PDF. Same layout engine for on-screen preview and file export (`@react-pdf/renderer`, ADR-0003). Page numbers belong only in viewer chrome, not in the downloaded file. Layout copy does not use em dashes; use commas.
_Avoid_: Template, Canadian preview, React PDF document (technical alias only), react-pdf export (alone), generated PDF, Print PDF (legacy)
