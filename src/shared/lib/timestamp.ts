/** Returns true when `value` is a finite Unix timestamp in milliseconds. */
export function isValidTimestamp(value: number): boolean {
	if (!Number.isFinite(value) || value <= 0) {
		return false;
	}
	const time = new Date(value).getTime();
	return Number.isFinite(time);
}

export function formatUpdatedAt(
	timestamp: number,
	locale = "en",
): string | null {
	if (!isValidTimestamp(timestamp)) {
		return null;
	}
	return new Date(timestamp).toLocaleDateString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
