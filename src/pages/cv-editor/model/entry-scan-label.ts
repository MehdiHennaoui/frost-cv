export function entryScanLabel(
	order1Based: number,
	derivedParts: readonly string[],
	sectionFallback: string,
): string {
	const derived = derivedParts
		.map((part) => part.trim())
		.filter((part) => part.length > 0)
		.join(" · ");
	const label = derived.length > 0 ? derived : sectionFallback;
	return `${order1Based} · ${label}`;
}

export function splitEntryScanLabel(label: string): {
	order: string;
	rest: string;
} {
	const sep = " · ";
	const index = label.indexOf(sep);
	if (index === -1) {
		return { order: "", rest: label };
	}
	return {
		order: label.slice(0, index),
		rest: label.slice(index + sep.length),
	};
}
