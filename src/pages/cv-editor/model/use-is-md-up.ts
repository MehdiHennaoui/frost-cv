import { useSyncExternalStore } from "react";

const MD_UP = "(min-width: 768px)";

function subscribe(onChange: () => void): () => void {
	if (typeof window.matchMedia !== "function") {
		return () => {};
	}
	const media = window.matchMedia(MD_UP);
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
	if (typeof window.matchMedia !== "function") {
		return true;
	}
	return window.matchMedia(MD_UP).matches;
}

/** Desktop split at Tailwind `md`; defaults to desktop when matchMedia is missing. */
export function useIsMdUp(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
