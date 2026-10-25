import { describe, expect, it } from "vitest";

import { formatUpdatedAt, isValidTimestamp } from "./timestamp";

describe("isValidTimestamp", () => {
	it("accepts a finite positive millisecond timestamp", () => {
		expect(isValidTimestamp(1_700_000_000_000)).toBe(true);
	});

	it("rejects NaN, Infinity, zero, and negatives", () => {
		expect(isValidTimestamp(Number.NaN)).toBe(false);
		expect(isValidTimestamp(Number.POSITIVE_INFINITY)).toBe(false);
		expect(isValidTimestamp(0)).toBe(false);
		expect(isValidTimestamp(-1)).toBe(false);
	});
});

describe("formatUpdatedAt", () => {
	it("formats a valid timestamp", () => {
		const formatted = formatUpdatedAt(1_700_000_000_000);
		expect(formatted).not.toBeNull();
		expect(formatted?.length).toBeGreaterThan(0);
	});

	it("returns null for an invalid timestamp", () => {
		expect(formatUpdatedAt(Number.NaN)).toBeNull();
	});
});
