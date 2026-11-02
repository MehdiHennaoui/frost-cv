import { useState } from "react";

/** Session-only expand set; default is all collapsed. */
export function useEntryCollapse() {
	const [expandedIds, setExpandedIds] = useState(() => new Set<string>());

	function isExpanded(id: string) {
		return expandedIds.has(id);
	}

	function toggle(id: string) {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	return { isExpanded, toggle };
}
