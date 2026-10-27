#!/usr/bin/env bash
# Lefthook pre-commit: block ticket/src commits on main/master.
set -euo pipefail

branch="$(git branch --show-current 2>/dev/null || true)"
case "$branch" in
main | master) ;;
*) exit 0 ;;
esac

staged="$(git diff --cached --name-only)"
if printf '%s\n' "$staged" | grep -qE '^(\.scratch/.+/issues/|src/)'; then
	echo "Refuse commits touching .scratch/**/issues/** or src/** on ${branch}."
	echo "Use a ticket branch: feature/<ticket-slug> (see git-branch-naming)."
	exit 1
fi
