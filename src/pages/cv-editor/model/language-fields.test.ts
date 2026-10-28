import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	createEmptyLanguage,
	languageEqual,
	languagesOf,
	withLanguages,
} from "./language-fields";

describe("languagesOf", () => {
	it("returns an empty list when languages is missing", () => {
		expect(languagesOf({})).toEqual([]);
	});

	it("normalizes persisted language entries", () => {
		expect(
			languagesOf({
				languages: [
					{
						id: "lang-1",
						language: "French",
						level: "Fluent",
						extra: "ignored",
					},
					{
						id: 2,
						language: null,
					},
				],
			}),
		).toEqual([
			{
				id: "lang-1",
				language: "French",
				level: "Fluent",
			},
			{
				id: "",
				language: "",
				level: "",
			},
		]);
	});
});

describe("withLanguages", () => {
	it("writes languages without dropping other content", () => {
		const content = createEmptyCvContent();
		content.identity = { firstName: "Ada" };
		const entry = createEmptyLanguage();
		entry.language = "English";

		const next = withLanguages(content, [entry]);

		expect(next.identity).toEqual({ firstName: "Ada" });
		expect(next.languages).toEqual([entry]);
		expect(next.education).toEqual([]);
	});
});

describe("languageEqual", () => {
	it("compares entry lists by value", () => {
		const a = [createEmptyLanguage()];
		expect(languageEqual(a, [{ ...a[0] }])).toBe(true);
		expect(languageEqual(a, [{ ...a[0], level: "B2" }])).toBe(false);
	});
});
