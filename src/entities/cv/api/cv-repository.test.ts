import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyCvContent } from "../model/cv";
import {
	createCv,
	deleteCv,
	getCv,
	listCvs,
	putCv,
	resetCvDatabase,
	saveCv,
} from "./cv-repository";

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
			locale: "fr",
			content: {},
			createdAt: 2_000,
			updatedAt: 2_000,
		});

		const cvs = await listCvs();

		expect(cvs.map((cv) => cv.title)).toEqual(["Newer CV", "Older CV"]);
		expect(cvs[0]?.locale).toBe("fr");
	});
});

describe("createCv", () => {
	beforeEach(async () => {
		await resetCvDatabase();
	});

	it("persists a CV with title, locale, empty section defaults, and timestamps", async () => {
		const cv = await createCv({ title: "  My CV  ", locale: "fr" });

		expect(cv.id).toBeTruthy();
		expect(cv.title).toBe("My CV");
		expect(cv.locale).toBe("fr");
		expect(cv.content).toEqual(createEmptyCvContent());
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

describe("getCv", () => {
	beforeEach(async () => {
		await resetCvDatabase();
	});

	it("returns the CV when the id exists", async () => {
		const created = await createCv({ title: "Target", locale: "en" });

		await expect(getCv(created.id)).resolves.toEqual(created);
	});

	it("returns undefined when the id is missing", async () => {
		await expect(getCv("missing-id")).resolves.toBeUndefined();
	});
});

describe("deleteCv", () => {
	beforeEach(async () => {
		await resetCvDatabase();
	});

	it("removes the resume from IndexedDB", async () => {
		const kept = await createCv({ title: "Keep me", locale: "en" });
		const removed = await createCv({ title: "Delete me", locale: "fr" });

		await deleteCv(removed.id);

		const listed = await listCvs();
		expect(listed.map((cv) => cv.id)).toEqual([kept.id]);
	});

	it("is a no-op when the id does not exist", async () => {
		const kept = await createCv({ title: "Keep me", locale: "en" });

		await expect(deleteCv("missing-id")).resolves.toBeUndefined();

		const listed = await listCvs();
		expect(listed.map((cv) => cv.id)).toEqual([kept.id]);
	});
});

describe("saveCv", () => {
	beforeEach(async () => {
		await resetCvDatabase();
	});

	it("persists content changes and bumps updatedAt", async () => {
		const created = await createCv({ title: "Editable", locale: "en" });
		const saved = await saveCv({
			...created,
			content: {
				...created.content,
				identity: { firstName: "Ada", description: "<p>Hi</p>" },
			},
			updatedAt: created.updatedAt,
		});

		expect(saved.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
		await expect(getCv(created.id)).resolves.toEqual(saved);
		expect(saved.content.identity).toEqual({
			firstName: "Ada",
			description: "<p>Hi</p>",
		});
	});
});
