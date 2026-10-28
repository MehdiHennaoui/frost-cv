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
			identity: {},
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
				sectionOrder: ["identity", "languages", "experiences", "education"],
			}),
		).toEqual(["identity", "languages", "experiences", "education"]);
	});

	it("drops legacy customs and syncs custom:<id> slots to customSections", () => {
		expect(
			sectionOrderOf({
				customSections: [{ id: "c1" }, { id: "c2" }],
				sectionOrder: [
					"identity",
					"experiences",
					"custom:c1",
					"education",
					"languages",
					"customs",
					"custom:orphan",
				],
			}),
		).toEqual([
			"identity",
			"experiences",
			"custom:c1",
			"education",
			"languages",
			"custom:c2",
		]);
	});

	it("falls back to builtins then custom ids when order is missing or incomplete", () => {
		expect(sectionOrderOf({})).toEqual([...DEFAULT_SECTION_ORDER]);
		expect(
			sectionOrderOf({ sectionOrder: ["experiences", "identity"] }),
		).toEqual([...DEFAULT_SECTION_ORDER]);
		expect(
			sectionOrderOf({
				customSections: [{ id: "c1" }],
				sectionOrder: ["identity", "languages"],
			}),
		).toEqual([
			"identity",
			"languages",
			"experiences",
			"education",
			"custom:c1",
		]);
	});
});
