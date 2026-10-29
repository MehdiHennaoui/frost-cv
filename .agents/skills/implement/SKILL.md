---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask. To list candidates, grep `**Status:**` under `.scratch/**/issues/` for `ready-for-agent` (and blockers); do not search chat history unless Status lines are ambiguous.

## Pre-prod vs prod (before any edit)

Before branching or coding, ask whether this implement is the **production** cut (need old-CV compatibility) or still **pre-prod** (break/replace shapes freely). Follow [no-legacy-cv-pre-prod](../../rules/no-legacy-cv-pre-prod.md). Do not assume from prior chat.

## Branch first

If `git branch --show-current` is `main` or `master` and this is tracker-ticket work: create and check out the ticket branch from up-to-date `main` **before** editing (see git-branch-naming: `feature/<ticket-slug>` or the matching type). Commit ticket work on that branch only.

When rearranging commits (e.g. moving work off `main`): stash or commit dirty files first — do not `git reset --hard` on a dirty tree.

## Build

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Commit on the ticket branch.

## Ship gate (before `Status: resolved`)

All of these must hold before flipping the issue to `resolved`:

1. Every change you intend for the ticket is committed (no leftover polish still dirty).
2. The ticket branch is pushed to `origin`.
3. Only then set `Status: resolved` on the issue file.

Do **not** open a pull request unless the user explicitly asks.
