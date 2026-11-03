#!/usr/bin/env bash
# Guard cv-editor segment layout: FSD segments stay ui/model; concerns are free subfolders.
set -euo pipefail

root="src/pages/cv-editor"
ui="$root/ui"
model="$root/model"
errors=0

fail() {
	echo "$*" >&2
	errors=1
}

if [[ ! -d $ui || ! -d $model ]]; then
	fail "Expected $ui and $model to exist."
	exit 1
fi

# Page shell only at ui/ segment root (FSD ui segment, not a concern folder).
while IFS= read -r -d '' file; do
	base="$(basename "$file")"
	case "$base" in
	cv-editor-page.tsx | cv-editor-page.test.tsx) ;;
	*)
		fail "Orphan under ui/: $file (only cv-editor-page(+.test) at segment root; put other UI in ui/<concern>/)."
		;;
	esac
done < <(find "$ui" -maxdepth 1 -type f -print0)

# No files at model/ segment root.
while IFS= read -r -d '' file; do
	fail "Orphan under model/: $file (put code in model/<concern>/)."
done < <(find "$model" -maxdepth 1 -type f -print0)

# Concern folders must not collide with FSD layer/segment names.
for segment in ui model; do
	for name in shared lib; do
		if [[ -d $root/$segment/$name ]]; then
			fail "Forbidden concern name: $segment/$name (collides with FSD layer/segment)."
		fi
	done
done

# No barrels inside segments; slice public API stays at pages/cv-editor/index.ts.
while IFS= read -r -d '' file; do
	fail "Barrel not allowed under cv-editor segments: $file (export from $root/index.ts only)."
done < <(find "$ui" "$model" \( -name 'index.ts' -o -name 'index.tsx' \) -print0)

if ((errors)); then
	exit 1
fi
