import { describe, expect, it } from "vitest";

import { text } from "./pdf-text";

describe("text", () => {
	it("returns Tailwind-paired fontSize and lineHeight for sm", () => {
		expect(text("sm")).toEqual({
			fontSize: 10.5,
			lineHeight: 20 / 14,
		});
	});
});
