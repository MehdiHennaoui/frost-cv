import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { listCvs, putCv, resetCvDatabase } from "./cv-repository";

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
