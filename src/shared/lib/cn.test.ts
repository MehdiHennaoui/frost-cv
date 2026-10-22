import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
	it("merges class names and skips falsy values", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
	});
});
