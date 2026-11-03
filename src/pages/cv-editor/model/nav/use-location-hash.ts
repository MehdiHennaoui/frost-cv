import { useEffect, useState } from "react";

function readHashId() {
	return window.location.hash.replace(/^#/, "");
}

export function useLocationHash() {
	const [hash, setHash] = useState(readHashId);

	useEffect(() => {
		function onHashChange() {
			setHash(readHashId());
		}
		window.addEventListener("hashchange", onHashChange);
		return () => window.removeEventListener("hashchange", onHashChange);
	}, []);

	return hash;
}

export function setLocationHash(id: string) {
	const next = `#${id}`;
	if (window.location.hash === next) {
		window.dispatchEvent(new HashChangeEvent("hashchange"));
		return;
	}
	window.location.hash = id;
}

export function scrollToHashTarget(id: string) {
	document.getElementById(id)?.scrollIntoView({
		block: "nearest",
		behavior: "smooth",
	});
}
