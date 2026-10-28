import { describe, expect, it } from "vitest";

import {
	currentMonthValue,
	entriesHaveValidMonthRanges,
	formatMonthYear,
	monthDateRangeLabel,
	monthRangeError,
} from "./month-year";

describe("currentMonthValue", () => {
	it("formats the calendar month as YYYY-MM", () => {
		expect(currentMonthValue(new Date(2026, 9, 28))).toBe("2026-10");
	});
});

describe("formatMonthYear / monthDateRangeLabel", () => {
	it("formats month names from the CV locale", () => {
		expect(formatMonthYear("2020-01", "en")).toBe("Jan 2020");
		expect(formatMonthYear("2020-01", "fr")).toBe("janv. 2020");
		expect(
			monthDateRangeLabel(
				{ startMonth: "2020-01", endMonth: "2021-06" },
				{ locale: "en" },
			),
		).toBe("Jan 2020 – Jun 2021");
		expect(
			monthDateRangeLabel(
				{ startMonth: "2020-01", endMonth: "", isCurrent: true },
				{ locale: "fr", presentLabel: "Présent" },
			),
		).toBe("janv. 2020 – Présent");
		expect(
			monthDateRangeLabel(
				{ startMonth: "2016-09", endMonth: "" },
				{ locale: "en" },
			),
		).toBe("Sep 2016");
	});
});

describe("monthRangeError", () => {
	it("accepts equal months and current roles", () => {
		expect(
			monthRangeError({ startMonth: "2020-01", endMonth: "2020-01" }, "err"),
		).toBeNull();
		expect(
			monthRangeError(
				{ startMonth: "2021-06", endMonth: "2020-01", isCurrent: true },
				"err",
			),
		).toBeNull();
		expect(
			monthRangeError({ startMonth: "2020-01", endMonth: "" }, "err"),
		).toBeNull();
	});

	it("rejects end before start", () => {
		const entry = { startMonth: "2021-06", endMonth: "2020-01" };
		expect(monthRangeError(entry, "err")).toBe("err");
		expect(entriesHaveValidMonthRanges([entry])).toBe(false);
	});
});
