import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	createEmptyExperience,
	experienceDateRangeError,
	experienceDateRangeLabel,
	experiencesEqual,
	experiencesHaveValidDateRanges,
	experiencesOf,
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

describe("experiencesEqual / dates", () => {
	it("compares entry lists by value", () => {
		const a = [createEmptyExperience()];
		expect(experiencesEqual(a, [{ ...a[0] }])).toBe(true);
		expect(experiencesEqual(a, [{ ...a[0], jobTitle: "x" }])).toBe(false);
	});

	it("formats ranges using the CV locale and present label", () => {
		expect(
			experienceDateRangeLabel(
				{
					...createEmptyExperience(),
					startMonth: "2020-01",
					endMonth: "2021-06",
					isCurrent: false,
				},
				"en",
				"Present",
			),
		).toBe("Jan 2020 – Jun 2021");

		expect(
			experienceDateRangeLabel(
				{
					...createEmptyExperience(),
					startMonth: "2020-01",
					isCurrent: true,
				},
				"fr",
				"Présent",
			),
		).toBe("janv. 2020 – Présent");
	});

	it("rejects end before start unless current", () => {
		const entry = {
			...createEmptyExperience(),
			startMonth: "2021-06",
			endMonth: "2020-01",
		};
		expect(experienceDateRangeError(entry)).toBe(
			"cvEditor.experiences.errors.endBeforeStart",
		);
		expect(experiencesHaveValidDateRanges([entry])).toBe(false);
		expect(experienceDateRangeError({ ...entry, isCurrent: true })).toBeNull();
	});
});
