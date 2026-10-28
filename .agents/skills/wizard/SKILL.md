---
name: wizard
description: >
  User-invoked only (`/wizard`). Do not model-invoke. Never for GitHub CLI
  re-auth, `gh` 401, or inventing `.scratch` auth scripts — tell the user
  instead. Use only when the user explicitly asks for an interactive setup
  script for infra / third-party dashboards they will run themselves.
disable-model-invocation: true
---

# Wizard

**Default in this repo: do not generate wizards.** If `gh` fails or credentials are missing, stop and tell the user what to run. Do not write `.scratch/*wizard*` or `gh-auth*` scripts.

Only continue when the user explicitly invoked `/wizard` and confirmed they want a script.

## When the user did invoke `/wizard`

A **wizard** is an interactive bash script for steps only a human can take (third-party dashboards, one-off cutovers). Copy [template.sh](template.sh); author stages below the `STAGES` marker; do not edit the library above it.

- Ephemeral by default: path ends in `.wizard.sh` under `.scratch/`, delete it when the job is done, **never commit** unless the user asks to keep a repeatable setup path.
- Lefthook refuses committing `.scratch/**/*.wizard.sh` and `.scratch/**/gh-auth*`.

## Process

### 1. Scope the procedure

List stages and captured values; confirm with the user before writing the script.

**Done when:** every stage is named, and for each value you know where it comes from, where it is written, and whether it is secret.

### 2. Map each stage's journey

Concrete UI path or command per stage. Do not invent dashboard steps you have not verified.

### 3. Author the wizard

Copy `template.sh`, set `TOTAL_STAGES`, one `stage` per step. Use `ask_secret` for secrets. Do not touch the library above the marker.

### 4. Verify and hand off

`bash -n` the script; `chmod +x`; tell the user how to run it. Do not run it end-to-end yourself.
