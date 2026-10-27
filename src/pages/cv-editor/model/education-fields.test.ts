import { describe, expect, it } from "vitest";

import { createEmptyCvContent } from "@/entities/cv";
import {
	createEmptyEducation,
	educationDateRangeError,
	educationDateRangeLabel,
	educationEntrySchema,
	educationEqual,
	educationHaveValidDateRanges,
	educationOf,
	moveEducationTo,
	removeEducation,
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

describe("educationEqual", () => {
	it("compares entry lists by value", () => {
		const a = [createEmptyEducation()];
		const b = [{ ...a[0] }];
		expect(educationEqual(a, b)).toBe(true);
		expect(educationEqual(a, [{ ...a[0], school: "x" }])).toBe(false);
	});
});

describe("moveEducationTo / removeEducation", () => {
	it("reorders to an index and removes by id", () => {
		const first = { ...createEmptyEducation(), id: "a", school: "A" };
		const second = { ...createEmptyEducation(), id: "b", school: "B" };
		const third = { ...createEmptyEducation(), id: "c", school: "C" };
		const list = [first, second, third];

		expect(moveEducationTo(list, "b", 0).map((e) => e.id)).toEqual([
			"b",
			"a",
			"c",
		]);
		expect(moveEducationTo(list, "a", 2).map((e) => e.id)).toEqual([
			"b",
			"c",
			"a",
		]);
		expect(moveEducationTo(list, "a", 0)).toEqual(list);
		expect(removeEducation(list, "b").map((e) => e.id)).toEqual(["a", "c"]);
	});
});

describe("educationDateRangeLabel", () => {
	it("formats month ranges", () => {
		expect(
			educationDateRangeLabel({
				...createEmptyEducation(),
				startMonth: "2016-09",
				endMonth: "2020-05",
			}),
		).toBe("09/2016 – 05/2020");

		expect(
			educationDateRangeLabel({
				...createEmptyEducation(),
				startMonth: "2016-09",
				endMonth: "",
			}),
		).toBe("09/2016");
	});
});

describe("educationEntrySchema date range", () => {
	it("accepts equal or ordered months", () => {
		expect(
			educationEntrySchema.safeParse({
				...createEmptyEducation(),
				startMonth: "2020-01",
				endMonth: "2020-01",
			}).success,
		).toBe(true);
		expect(
			educationDateRangeError({
				...createEmptyEducation(),
				startMonth: "2020-01",
				endMonth: "",
			}),
		).toBeNull();
	});

	it("rejects end before start", () => {
		const entry = {
			...createEmptyEducation(),
			startMonth: "2021-06",
			endMonth: "2020-01",
		};
		expect(educationEntrySchema.safeParse(entry).success).toBe(false);
		expect(educationDateRangeError(entry)).toBe(
			"cvEditor.education.errors.endBeforeStart",
		);
		expect(educationHaveValidDateRanges([entry])).toBe(false);
	});
});
