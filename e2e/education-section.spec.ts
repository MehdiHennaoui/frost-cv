import { expect, test } from "@playwright/test";

import {
	expandLastEntry,
	expectReactPdfPreview,
	flushEditorPersist,
	reloadEditor,
} from "./helpers/preview";

test.describe("education section", () => {
	test("adds an education entry and keeps it after blur flush", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Education CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add education" }).click();
		await expandLastEntry(sidebar);

		await sidebar.getByLabel("School name").last().fill("McGill University");
		await sidebar
			.getByLabel("Degree name")
			.last()
			.fill("B.Sc. Computer Science");
		await sidebar.getByLabel("City / country").last().fill("Montreal, Canada");
		await sidebar.getByLabel("Start month").last().fill("2016-09");
		await sidebar.getByLabel("End month").last().fill("2020-05");
		await flushEditorPersist(page);

		await expectReactPdfPreview(page);

		await reloadEditor(page);
		const after = page.getByTestId("app-sidebar-portal");
		await expandLastEntry(after);
		await expect(after.getByLabel("School name").last()).toHaveValue(
			"McGill University",
		);
		await expect(after.getByLabel("Degree name").last()).toHaveValue(
			"B.Sc. Computer Science",
		);
		await expect(after.getByLabel("City / country").last()).toHaveValue(
			"Montreal, Canada",
		);
		await expect(after.getByLabel("Start month").last()).toHaveValue("2016-09");
		await expect(after.getByLabel("End month").last()).toHaveValue("2020-05");
	});
});
