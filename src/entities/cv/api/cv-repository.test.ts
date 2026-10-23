import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { createCv, listCvs, putCv, resetCvDatabase } from "./cv-repository";

describe("listCvs", () => {
	beforeEach(async () => {
		await resetCvDatabase();
	});

	it("returns an empty list when no CVs exist", async () => {
		await expect(listCvs()).resolves.toEqual([]);
	});

	it("returns CVs ordered by updatedAt descending", async () => {
		await putCv({
			id: "cv-old",
			title: "Older CV",
			locale: "en",
			content: {},
			createdAt: 1_000,
			updatedAt: 1_000,
		});
		await putCv({
			id: "cv-new",
			title: "Newer CV",
			locale: "fr-CA",
			content: {},
			createdAt: 2_000,
			updatedAt: 2_000,
		});

		const cvs = await listCvs();

		expect(cvs.map((cv) => cv.title)).toEqual(["Newer CV", "Older CV"]);
		expect(cvs[0]?.locale).toBe("fr-CA");
	});
});

describe("createCv", () => {
	beforeEach(async () => {
		await resetCvDatabase();
	});

	it("persists a CV with title, locale, empty section defaults, and timestamps", async () => {
		const cv = await createCv({ title: "  My CV  ", locale: "fr-CA" });

		expect(cv.id).toBeTruthy();
		expect(cv.title).toBe("My CV");
		expect(cv.locale).toBe("fr-CA");
		expect(cv.content).toEqual({
			identity: {},
			experiences: [],
			education: [],
			languages: [],
			customSections: [],
		});
		expect(cv.createdAt).toBe(cv.updatedAt);
		expect(cv.createdAt).toBeGreaterThan(0);

		const listed = await listCvs();
		expect(listed).toHaveLength(1);
		expect(listed[0]?.id).toBe(cv.id);
	});

	it("rejects an empty title", async () => {
		await expect(createCv({ title: "   ", locale: "en" })).rejects.toThrow(
			/title/i,
		);
		await expect(listCvs()).resolves.toEqual([]);
	});
});
