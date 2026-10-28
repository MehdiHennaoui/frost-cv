#!/usr/bin/env bash
# Lefthook pre-commit: block ephemeral auth/wizard scripts under .scratch/.
set -euo pipefail

staged="$(git diff --cached --name-only)"
if printf '%s\n' "$staged" | grep -qE '^\.scratch/.+\.(wizard\.sh)$|^\.scratch/.+gh-auth'; then
	echo "Refuse committing scratch wizard / gh-auth scripts under .scratch/."
	echo "Tell the user what to run; do not check in ephemeral wizards."
	exit 1
fi
