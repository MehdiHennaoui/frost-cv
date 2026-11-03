import { describe, expect, it } from "vitest";

import { entryScanLabel, splitEntryScanLabel } from "./entry-scan-label";

describe("entryScanLabel", () => {
	it("joins non-empty parts after a 1-based order", () => {
		expect(entryScanLabel(1, ["Engineer", "Acme"], "Experiences")).toBe(
			"1 · Engineer · Acme",
		);
		expect(entryScanLabel(2, ["B.Sc.", "McGill"], "Education")).toBe(
			"2 · B.Sc. · McGill",
		);
		expect(entryScanLabel(3, ["French"], "Languages")).toBe("3 · French");
	});

	it("omits blank parts and falls back to the section name when none remain", () => {
		expect(entryScanLabel(1, ["Engineer", ""], "Experiences")).toBe(
			"1 · Engineer",
		);
		expect(entryScanLabel(1, ["", "  Acme  "], "Experiences")).toBe("1 · Acme");
		expect(entryScanLabel(1, ["", ""], "Experiences")).toBe("1 · Experiences");
		expect(entryScanLabel(4, ["   "], "Languages")).toBe("4 · Languages");
	});
});

describe("splitEntryScanLabel", () => {
	it("splits the leading order from the rest of the scan label", () => {
		expect(splitEntryScanLabel("1 · Engineer · Acme")).toEqual({
			order: "1",
			rest: "Engineer · Acme",
		});
		expect(splitEntryScanLabel("Experiences")).toEqual({
			order: "",
			rest: "Experiences",
		});
	});
});
