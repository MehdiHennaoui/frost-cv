/** Returns true when `value` is a finite Unix timestamp in milliseconds. */
export function isValidTimestamp(value: number): boolean {
	if (!Number.isFinite(value) || value <= 0) {
		return false;
	}
	const time = new Date(value).getTime();
	return Number.isFinite(time);
}

/**
 * Formats a Unix ms timestamp for display.
 * `en` uses en-CA. `fr-CA` uses French (Canada).
 * Falls back to a stable English label when the timestamp is invalid.
 */
export function formatUpdatedAt(timestamp: number, locale = "en"): string {
	if (!isValidTimestamp(timestamp)) {
		return "Unknown date";
	}
	const dateLocale = locale === "fr-CA" ? "fr-CA" : "en-CA";
	return new Date(timestamp).toLocaleDateString(dateLocale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}
