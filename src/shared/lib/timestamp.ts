/** Returns true when `value` is a finite Unix timestamp in milliseconds. */
export function isValidTimestamp(value: number): boolean {
	if (!Number.isFinite(value) || value <= 0) {
		return false;
	}
	const time = new Date(value).getTime();
	return Number.isFinite(time);
}

/**
 * Formats a Unix ms timestamp for display (en-CA).
 * Falls back to a stable label when the timestamp is invalid.
 */
export function formatUpdatedAt(timestamp: number): string {
	if (!isValidTimestamp(timestamp)) {
		return "Unknown date";
	}
	return new Date(timestamp).toLocaleDateString("en-CA", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
