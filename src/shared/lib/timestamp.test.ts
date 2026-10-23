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
	it("formats a valid timestamp with en-CA locale options", () => {
		const formatted = formatUpdatedAt(1_700_000_000_000);
		expect(formatted).not.toBe("Unknown date");
		expect(formatted.length).toBeGreaterThan(0);
	});

	it("returns Unknown date for an invalid timestamp", () => {
		expect(formatUpdatedAt(Number.NaN)).toBe("Unknown date");
	});
});
