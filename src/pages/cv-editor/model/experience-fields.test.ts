import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	createEmptyExperience,
	experienceDateRangeLabel,
	experiencesEqual,
	experiencesOf,
	moveExperience,
	removeExperience,
	withExperiences,
} from "./experience-fields";

describe("experiencesOf", () => {
	it("returns an empty list when experiences are missing", () => {
		expect(experiencesOf({})).toEqual([]);
	});

	it("normalizes persisted experience entries", () => {
		expect(
			experiencesOf({
				experiences: [
					{
						id: "exp-1",
						jobTitle: "Engineer",
						company: "Acme",
						location: "Montreal",
						startMonth: "2020-01",
						endMonth: "2021-06",
						isCurrent: false,
						description: "<p>Built stuff</p>",
						extra: "ignored",
					},
					{
						id: 2,
						jobTitle: null,
						isCurrent: true,
					},
				],
			}),
		).toEqual([
			{
				id: "exp-1",
				jobTitle: "Engineer",
				company: "Acme",
				location: "Montreal",
				startMonth: "2020-01",
				endMonth: "2021-06",
				isCurrent: false,
				description: "<p>Built stuff</p>",
			},
			{
				id: "",
				jobTitle: "",
				company: "",
				location: "",
				startMonth: "",
				endMonth: "",
				isCurrent: true,
				description: "",
			},
		]);
	});
});

describe("withExperiences", () => {
	it("writes experiences without dropping other content", () => {
		const content = createEmptyCvContent();
		content.identity = { firstName: "Ada" };
		const entry = createEmptyExperience();
		entry.jobTitle = "Dev";

		const next = withExperiences(content, [entry]);

		expect(next.identity).toEqual({ firstName: "Ada" });
		expect(next.experiences).toEqual([entry]);
		expect(next.education).toEqual([]);
	});
});

describe("experiencesEqual", () => {
	it("compares entry lists by value", () => {
		const a = [createEmptyExperience()];
		const b = [{ ...a[0] }];
		expect(experiencesEqual(a, b)).toBe(true);
		expect(experiencesEqual(a, [{ ...a[0], jobTitle: "x" }])).toBe(false);
	});
});

describe("moveExperience / removeExperience", () => {
	it("reorders and removes by id", () => {
		const first = { ...createEmptyExperience(), id: "a", jobTitle: "A" };
		const second = { ...createEmptyExperience(), id: "b", jobTitle: "B" };
		const third = { ...createEmptyExperience(), id: "c", jobTitle: "C" };
		const list = [first, second, third];

		expect(moveExperience(list, "b", "up").map((e) => e.id)).toEqual([
			"b",
			"a",
			"c",
		]);
		expect(moveExperience(list, "b", "down").map((e) => e.id)).toEqual([
			"a",
			"c",
			"b",
		]);
		expect(moveExperience(list, "a", "up")).toEqual(list);
		expect(removeExperience(list, "b").map((e) => e.id)).toEqual(["a", "c"]);
	});
});

describe("experienceDateRangeLabel", () => {
	it("formats ranges using the provided present label", () => {
		expect(
			experienceDateRangeLabel(
				{
					...createEmptyExperience(),
					startMonth: "2020-01",
					endMonth: "2021-06",
					isCurrent: false,
				},
				"Present",
			),
		).toBe("01/2020 – 06/2021");

		expect(
			experienceDateRangeLabel(
				{
					...createEmptyExperience(),
					startMonth: "2020-01",
					isCurrent: true,
				},
				"Present",
			),
		).toBe("01/2020 – Present");

		expect(
			experienceDateRangeLabel(
				{
					...createEmptyExperience(),
					startMonth: "2020-01",
					isCurrent: true,
				},
				"Présent",
			),
		).toBe("01/2020 – Présent");
	});
});
