import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	entriesEqual,
	entriesOf,
	moveEntryTo,
	removeEntry,
	withContentEntries,
} from "./entry-list";

describe("moveEntryTo / removeEntry", () => {
	it("reorders to an index and removes by id", () => {
		const list = [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
			{ id: "c", label: "C" },
		];

		expect(moveEntryTo(list, "b", 0).map((e) => e.id)).toEqual(["b", "a", "c"]);
		expect(moveEntryTo(list, "a", 2).map((e) => e.id)).toEqual(["b", "c", "a"]);
		expect(moveEntryTo(list, "a", 0)).toEqual(list);
		expect(removeEntry(list, "b").map((e) => e.id)).toEqual(["a", "c"]);
	});
});

describe("entriesEqual", () => {
	it("compares entry lists by value", () => {
		const a = [{ id: "1", name: "x" }];
		expect(entriesEqual(a, [{ ...a[0] }])).toBe(true);
		expect(entriesEqual(a, [{ ...a[0], name: "y" }])).toBe(false);
	});
});

describe("entriesOf / withContentEntries", () => {
	it("reads and writes a content key without dropping siblings", () => {
		const content = createEmptyCvContent();
		content.identity = { firstName: "Ada" };

		expect(entriesOf({}, "education", () => ({ id: "x" }))).toEqual([]);

		const next = withContentEntries(content, "education", [
			{ id: "edu-1", school: "McGill" },
		]);
		expect(next.identity).toEqual({ firstName: "Ada" });
		expect(next.education).toEqual([{ id: "edu-1", school: "McGill" }]);
	});
});
