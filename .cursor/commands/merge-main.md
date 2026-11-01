---
description: Merge this branch into main, then delete it locally and on the remote
---

Merge the current feature branch into `main`, push `main`, then delete that feature branch locally and on `origin`.

## Before you start

1. Confirm `git branch --show-current` is **not** `main` or `master`. If it is, stop and say so.
2. Confirm the working tree is clean (no uncommitted changes you need). If dirty, stop and ask whether to commit, stash, or abort.
3. Note the feature branch name; you will delete exactly that branch after the merge.

Do not force-push. Do not delete `main` / `master`. Do not use `git branch -D` unless a normal `-d` fails because the branch was already fully merged and you verified that.

## Merge

Prefer an open PR when one exists:

1. `gh pr view --json number,state,mergeable,url` for the current branch.
2. If there is an open mergeable PR: `gh pr merge --merge` (or `--squash` only if the user asked for squash). Wait until it completes.
3. `git fetch origin` and `git checkout main` then `git pull`.

If there is **no** PR:

1. `git fetch origin`
2. `git checkout main` and `git pull`
3. `git merge <feature-branch>`
4. `git push origin main`

## Delete the feature branch

After `main` has the merge and is pushed:

1. `git branch -d <feature-branch>` (local)
2. `git push origin --delete <feature-branch>` (remote), if the remote branch still exists
3. `git fetch --prune`
4. Stay on `main` and show `git status -sb` plus a one-line confirmation of what was merged and deleted.

## Do not

- Merge or delete when the user only asked about the flow
- Leave the feature branch checked out after a successful land
- Skip the remote delete when the remote branch still exists
