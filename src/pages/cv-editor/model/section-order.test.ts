import { describe, expect, it } from "vitest";

import { createEmptyCvContent, sectionOrderOf } from "@/entities/cv";
import { moveSection } from "./section-order";

describe("moveSection", () => {
	it("keeps the header first and moves a section to the chosen slot", () => {
		const content = {
			...createEmptyCvContent(),
			sectionOrder: [
				"identity",
				"experiences",
				"education",
				"languages",
				"custom:c1",
			],
		};

		expect(sectionOrderOf(moveSection(content, "custom:c1", 1))).toEqual([
			"identity",
			"experiences",
			"custom:c1",
			"education",
			"languages",
		]);
	});

	it("leaves content unchanged for the header or an invalid slot", () => {
		const content = createEmptyCvContent();

		expect(moveSection(content, "identity", 1)).toBe(content);
		expect(moveSection(content, "education", 1)).toBe(content);
		expect(moveSection(content, "education", -1)).toBe(content);
		expect(moveSection(content, "education", 9)).toBe(content);
	});
});
