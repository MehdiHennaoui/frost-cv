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
