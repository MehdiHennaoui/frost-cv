import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "./cv";

describe("createEmptyCvContent", () => {
	it("returns empty section defaults", () => {
		expect(createEmptyCvContent()).toEqual({
			identity: {},
			experiences: [],
			education: [],
			languages: [],
			customSections: [],
		});
	});
});
