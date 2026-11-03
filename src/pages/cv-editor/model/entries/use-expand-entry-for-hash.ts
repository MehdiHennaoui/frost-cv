import { useEffect, useRef } from "react";

/** Expand the hashed entry once when the hash changes; leave other collapse state alone. */
export function useExpandEntryForHash(
	hash: string,
	ownsEntry: (id: string) => boolean,
	expand: (id: string) => void,
) {
	const ownsEntryRef = useRef(ownsEntry);
	const expandRef = useRef(expand);
	ownsEntryRef.current = ownsEntry;
	expandRef.current = expand;

	useEffect(() => {
		if (!hash || !ownsEntryRef.current(hash)) {
			return;
		}
		expandRef.current(hash);
	}, [hash]);
}
