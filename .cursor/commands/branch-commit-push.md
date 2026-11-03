---
description: Create a typed kebab branch, commit current work, and push
---

Create a branch that follows the repo naming rule, commit the current work on it, then push.

Optional args: `$ARGUMENTS` as `<type>/<kebab-description>` or just a kebab slug (infer the type from the diff).

## Branch name

Follow `.agents/rules/git-branch-naming.md` (and `.cursor/rules/git-branch-naming.mdc`):

```text
<type>/<kebab-description>
```

Allowed types only: `feature`, `fix`, `core`, `refactor`, `chore`, `docs`, `prototype`, `research`.

- No spaces, underscores, or PascalCase in the description.
- Do not invent prefixes (`hotfix/`, `bugfix/`, …).
- Prefer the ticket kebab slug when this work comes from a numbered issue file.
- If `$ARGUMENTS` is already `type/slug`, use it. If it is only a slug, pick the type from the change. If args are missing, derive both from the diff and recent commits; ask once only when the type is ambiguous.

## Steps

1. Run in parallel: `git status`, `git diff` (staged + unstaged), `git log -8 --oneline`, `git branch --show-current`.
2. If there is nothing to commit, say so and stop (no empty commit, no branch only for show).
3. Resolve the branch name as above.
4. **Branch checkout**
   - If HEAD is `main`/`master`: `git fetch origin`, update `main`/`master`, then `git checkout -b <type>/<kebab-description>`. Lefthook blocks `src/**` commits on `main` — never commit there.
   - If HEAD is already that exact branch: stay on it.
   - If HEAD is another non-main branch and the tree is dirty: create/switch with `git checkout -b <type>/<kebab-description>` from the current HEAD only when that keeps the uncommitted work; otherwise stop and ask.
5. Stage only the relevant files (no secrets). Commit with a Conventional Commits message focused on **why** (same standards as `/commit-and-push`). Use a HEREDOC. Do not amend, skip hooks, or force-push.
6. If the commit fails on a hook, fix and make a **new** commit.
7. `git push -u origin HEAD`.
8. Show the branch name, commit subject, and remote tracking in one short confirmation.

## Do not

- Commit on `main`/`master`
- Force-push or `--no-verify`
- Create a branch when there is nothing to commit
- Use a type outside the allowed list
