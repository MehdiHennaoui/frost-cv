import { describe, expect, it, vi } from "vitest";

import { createEmptyCvContent, sectionOrderOf } from "@/entities/cv";
import {
	addCustomSection,
	customSectionEqual,
	customSectionOf,
	customSectionsOf,
	removeCustomSection,
	withCustomSection,
} from "./custom-section-fields";

const ID_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as ReturnType<
	typeof crypto.randomUUID
>;
const ID_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as ReturnType<
	typeof crypto.randomUUID
>;

describe("customSectionsOf", () => {
	it("returns an empty list when customSections is missing", () => {
		expect(customSectionsOf({})).toEqual([]);
	});

	it("reads title and description strings", () => {
		expect(
			customSectionsOf({
				customSections: [
					{ id: "c1", title: "Skills", description: "<p>Rust</p>" },
					{ id: 2, title: null },
				],
			}),
		).toEqual([
			{ id: "c1", title: "Skills", description: "<p>Rust</p>" },
			{ id: "", title: "", description: "" },
		]);
	});
});

describe("addCustomSection / removeCustomSection", () => {
	it("appends a section and a top-level custom:<id> order entry", () => {
		vi.spyOn(crypto, "randomUUID").mockReturnValue(ID_A);
		const content = createEmptyCvContent();
		const { content: next, section } = addCustomSection(content);

		expect(section).toEqual({
			id: ID_A,
			title: "",
			description: "",
		});
		expect(customSectionsOf(next)).toEqual([section]);
		expect(sectionOrderOf(next)).toEqual([
			"identity",
			"experiences",
			"education",
			"languages",
			`custom:${ID_A}`,
		]);
	});

	it("removes the section and its order slot without dropping others", () => {
		vi.spyOn(crypto, "randomUUID")
			.mockReturnValueOnce(ID_A)
			.mockReturnValueOnce(ID_B);
		let content = createEmptyCvContent();
		content = addCustomSection(content).content;
		content = addCustomSection(content).content;
		content = {
			...content,
			experiences: [],
		};

		const next = removeCustomSection(content, ID_A);
		expect(customSectionsOf(next).map((section) => section.id)).toEqual([ID_B]);
		expect(sectionOrderOf(next)).toEqual([
			"identity",
			"experiences",
			"education",
			"languages",
			`custom:${ID_B}`,
		]);
		expect(next.experiences).toEqual([]);
	});
});

describe("withCustomSection", () => {
	it("patches one section without dropping siblings", () => {
		const content = {
			...createEmptyCvContent(),
			customSections: [
				{ id: "a", title: "A", description: "" },
				{ id: "b", title: "B", description: "" },
			],
			sectionOrder: [
				"identity",
				"experiences",
				"education",
				"languages",
				"custom:a",
				"custom:b",
			],
		};

		const next = withCustomSection(content, {
			id: "a",
			title: "Skills",
			description: "<p>Go</p>",
		});

		expect(customSectionOf(next, "a")).toEqual({
			id: "a",
			title: "Skills",
			description: "<p>Go</p>",
		});
		expect(customSectionOf(next, "b")?.title).toBe("B");
	});

	it("compares sections by fields", () => {
		expect(
			customSectionEqual(
				{ id: "a", title: "T", description: "D" },
				{ id: "a", title: "T", description: "D" },
			),
		).toBe(true);
		expect(
			customSectionEqual(
				{ id: "a", title: "T", description: "D" },
				{ id: "a", title: "T", description: "X" },
			),
		).toBe(false);
	});
});
