# Canadian CV builder — user stories

Product framing from the grill session. Implementation tickets live under [`issues/`](./issues/).

## Settled decisions

| Area | Decision |
| --- | --- |
| Runtime | Local-only (browser). No auth, no cloud sync. |
| Persistence | IndexedDB via **Dexie** (MIT). |
| UI i18n | `en` + `fr` via **i18next** / **react-i18next**. English is the source locale. Preference persists via **i18next-browser-languagedetector** (`i18nextLng` in `localStorage`), defaults to `en`. |
| CV metadata | Each CV has a **title** and a **locale** (content / PDF label language). |
| Header (always first) | First name, last name, job title, email, phone, postal code, LinkedIn, GitHub, website, description (WYSIWYG). |
| v1 sections | Experiences, Education/Formation, Languages, N custom sections. |
| Out of v1 | Certifications as a separate section; page-length recommendation UI. |
| Languages entries | Language name + **free-text** level (not an enum). |
| Custom sections | Each custom block is a **top-level** section in the global order (can sit between Experiences, Education, Languages, etc.). |
| Section order | Header fixed at top. Other sections reorderable via **drag-and-drop** (@dnd-kit) **and** a position selector. Order persists immediately. |
| Forms | **TanStack Form**. Debounced autosave (**1s** after last change) per block; flush immediately on blur and on leaving the editor route. No Save / Cancel buttons; no dirty-guard modal. |
| Dates | Month + year only, in every dated section. Current job hides end date; PDF shows Present / Présent from CV locale. |
| WYSIWYG | **TipTap** core OSS only (no Cloud / Pro). Bold, italic, lists, links. Stored as **HTML**. |
| Preview / PDF | Canadian layout with Tailwind. PDF = browser **print** of the preview. No hard page limit in v1. |
| Editor shell | Shared `AppLayout` chrome (locale, page title, sidebar). Edit UI is portaled into the sidebar on the CV editor route; preview is the main pane. Not page-local split columns or mobile Edit/Preview tabs. |
| JSON | Export and import (create new CV or replace an existing one after confirmation). |
| Tracker | Local files in this folder — not GitHub Issues. |

## Stack context

Existing app: TanStack Start + React 19 + Vite + FSD + Tailwind / shadcn. Product layers are greenfield.

## User stories (v1)

### US-01 — List CVs

As a user, I can see the list of my locally stored CVs (title, language, last updated) so I can pick one to work on.

### US-02 — Create CV

As a user, I can create a CV by entering a title and language in a modal, then land in the editor for that CV.

### US-03 — Delete CV

As a user, I can delete a CV after confirming in a modal so I do not lose data by accident.

### US-04 — Switch UI language

As a user, I can switch the application UI between English and French (Canada).

### US-05 — Edit header

As a user, I can edit the header fields (including WYSIWYG description); changes persist automatically after 1s of idle typing, or immediately when I leave the field or the editor route.

### US-06 — Experiences

As a user, I can add, edit, delete, and reorder work experiences (job title, company, location, start/end month-year or current role, WYSIWYG description); edits autosave like the header.

### US-07 — Education

As a user, I can add, edit, delete, and reorder education entries (school, degree, start/end month-year, city/country); edits autosave like the header.

### US-08 — Languages

As a user, I can add, edit, delete, and reorder language entries (language name + free-text level); edits autosave like the header.

### US-09 — Custom sections

As a user, I can add custom sections (title + WYSIWYG description), each appearing as its own top-level section in the CV order; edits autosave like the header.

### US-10 — Reorder sections

As a user, I can reorder non-header sections with drag-and-drop and a position selector; the new order is saved immediately.

### US-11 — Canadian preview

As a user, I see a live Canadian-format preview of **persisted** CV data in the main pane (updates after autosave flush), while edit UI lives in the app sidebar on the editor route (opens on enter, closes on leave).

### US-12 — Export PDF

As a user, I can export the CV as a PDF by printing the Canadian preview from the browser.

### US-13 — Export JSON

As a user, I can download the current CV as a JSON file for backup or transfer.

### US-14 — Import JSON

As a user, I can import a CV from a JSON file, creating a new CV or replacing an existing one after confirmation.

## Backlog (not v1 tickets)

### US-15 — Page length recommendation

As a user, I am warned when the CV is likely longer than about two pages (recommendation only; no hard limit).

### US-16 — Marketing landing page

As a visitor, I land on a branded home/landing page at `/` that explains Frost CV and links me into the CV list (or create flow). Until this ships, `/` redirects to `/cvs` and `pages/home` stays as a placeholder.

### Later — Certifications

Separate certifications section (distinct from education), deferred after v1.
