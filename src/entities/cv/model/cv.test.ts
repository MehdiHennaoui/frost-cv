import { describe, expect, it } from "vitest";

import {
	createEmptyCvContent,
	DEFAULT_SECTION_ORDER,
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

describe("sectionOrderOf", () => {
	it("returns the persisted order when identity is first", () => {
		expect(
			sectionOrderOf({
				sectionOrder: [
					"identity",
					"languages",
					"experiences",
					"education",
					"customs",
				],
			}),
		).toEqual(["identity", "languages", "experiences", "education", "customs"]);
	});

	it("falls back to the default order when identity is missing, not first, or incomplete", () => {
		expect(sectionOrderOf({})).toEqual([...DEFAULT_SECTION_ORDER]);
		expect(
			sectionOrderOf({ sectionOrder: ["experiences", "identity"] }),
		).toEqual([...DEFAULT_SECTION_ORDER]);
		expect(sectionOrderOf({ sectionOrder: ["identity", "languages"] })).toEqual(
			[...DEFAULT_SECTION_ORDER],
		);
	});
});
