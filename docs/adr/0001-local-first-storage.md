# Local-first storage for v1

Frost CV stores each CV in the browser (IndexedDB via Dexie) as the source of truth for v1: no account, no sync API, no server-backed CV persistence. That keeps the first release simple and private. A later backend or sync layer is allowed if the domain model (CV, sections, entries, drafts) stays independent of the storage adapter—v1 deliberately does not build sync or auth.
