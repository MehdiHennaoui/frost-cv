import { describe, expect, it } from "vitest";

import {
	createEmptyCvContent,
	customSectionIdFromKey,
	customSectionKey,
	DEFAULT_SECTION_ORDER,
	isCustomSectionKey,
	sectionOrderOf,
} from "./cv";

describe("createEmptyCvContent", () => {
	it("returns empty section defaults with identity-first section order", () => {
		expect(createEmptyCvContent()).toEqual({
			identity: {
				firstName: "",
				lastName: "",
				jobTitle: "",
				email: "",
				phone: "",
				postalCode: "",
				linkedin: "",
				github: "",
				website: "",
				description: "",
			},
			experiences: [],
			education: [],
			languages: [],
			customSections: [],
			sectionOrder: [...DEFAULT_SECTION_ORDER],
		});
	});
});

describe("custom section order keys", () => {
	it("builds and parses custom:<id> keys", () => {
		expect(customSectionKey("abc")).toBe("custom:abc");
		expect(customSectionIdFromKey("custom:abc")).toBe("abc");
		expect(isCustomSectionKey("custom:abc")).toBe(true);
		expect(isCustomSectionKey("customs")).toBe(false);
		expect(isCustomSectionKey("custom:")).toBe(false);
	});
});

describe("sectionOrderOf", () => {
	it("returns the persisted order when identity is first", () => {
		expect(
			sectionOrderOf({
				sectionOrder: [
					"identity",
					"languages",
					"custom:c1",
					"experiences",
					"education",
				],
			}),
		).toEqual([
			"identity",
			"languages",
			"custom:c1",
			"experiences",
			"education",
		]);
	});

	it("falls back to builtins then custom ids when order is missing or invalid", () => {
		expect(sectionOrderOf({})).toEqual([...DEFAULT_SECTION_ORDER]);
		expect(
			sectionOrderOf({ sectionOrder: ["experiences", "identity"] }),
		).toEqual([...DEFAULT_SECTION_ORDER]);
		expect(
			sectionOrderOf({
				customSections: [{ id: "c1" }],
				sectionOrder: ["identity", "languages", "customs"],
			}),
		).toEqual([...DEFAULT_SECTION_ORDER, "custom:c1"]);
	});
});
