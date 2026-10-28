import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	createEmptyEducation,
	educationDateRangeError,
	educationDateRangeLabel,
	educationEqual,
	educationHaveValidDateRanges,
	educationOf,
	withEducation,
} from "./education-fields";

describe("educationOf", () => {
	it("returns an empty list when education is missing", () => {
		expect(educationOf({})).toEqual([]);
	});

	it("normalizes persisted education entries", () => {
		expect(
			educationOf({
				education: [
					{
						id: "edu-1",
						school: "McGill",
						degree: "B.Sc.",
						location: "Montreal, Canada",
						startMonth: "2016-09",
						endMonth: "2020-05",
						extra: "ignored",
					},
					{
						id: 2,
						school: null,
					},
				],
			}),
		).toEqual([
			{
				id: "edu-1",
				school: "McGill",
				degree: "B.Sc.",
				location: "Montreal, Canada",
				startMonth: "2016-09",
				endMonth: "2020-05",
			},
			{
				id: "",
				school: "",
				degree: "",
				location: "",
				startMonth: "",
				endMonth: "",
			},
		]);
	});
});

describe("withEducation", () => {
	it("writes education without dropping other content", () => {
		const content = createEmptyCvContent();
		content.identity = { firstName: "Ada" };
		const entry = createEmptyEducation();
		entry.school = "McGill";

		const next = withEducation(content, [entry]);

		expect(next.identity).toEqual({ firstName: "Ada" });
		expect(next.education).toEqual([entry]);
		expect(next.experiences).toEqual([]);
	});
});

describe("educationEqual / dates", () => {
	it("compares entry lists by value", () => {
		const a = [createEmptyEducation()];
		expect(educationEqual(a, [{ ...a[0] }])).toBe(true);
		expect(educationEqual(a, [{ ...a[0], school: "x" }])).toBe(false);
	});

	it("formats ranges and rejects end before start", () => {
		expect(
			educationDateRangeLabel(
				{
					...createEmptyEducation(),
					startMonth: "2016-09",
					endMonth: "2020-05",
				},
				"en",
			),
		).toBe("Sep 2016 – May 2020");
		expect(
			educationDateRangeLabel(
				{
					...createEmptyEducation(),
					startMonth: "2016-09",
					endMonth: "2020-05",
				},
				"fr",
			),
		).toBe("sept. 2016 – mai 2020");

		const bad = {
			...createEmptyEducation(),
			startMonth: "2021-06",
			endMonth: "2020-01",
		};
		expect(educationDateRangeError(bad)).toBe(
			"cvEditor.education.errors.endBeforeStart",
		);
		expect(educationHaveValidDateRanges([bad])).toBe(false);
	});
});
