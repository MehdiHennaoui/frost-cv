# One library JSON backup file

Library export and Library import use a single JSON file that wraps an array of existing single-CV export documents (`{ schemaVersion: 1, cvs: [...] }`), not a zip of separate files. One download/upload keeps backup and restore simple in a local-first browser app, and the envelope stays distinguishable from a single-CV file so the wrong Import action can fail clearly. Zip-of-files was rejected as extra UX and tooling cost for v1.
