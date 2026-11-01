import { expect, test } from "@playwright/test";

import {
	expectReactPdfPreview,
	flushEditorPersist,
	reloadEditor,
	sidebarSectionTitles,
} from "./helpers/preview";

test.describe("custom sections", () => {
	test("adds a custom section and keeps it after blur flush", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Custom Sections CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add custom section" }).click();

		await sidebar.getByLabel("Section title").last().fill("Skills");
		await flushEditorPersist(page);

		await expect(sidebarSectionTitles(sidebar)).toContainText(["Skills"]);
		await expectReactPdfPreview(page);

		await reloadEditor(page);
		const after = page.getByTestId("app-sidebar-portal");
		await expect(after.getByLabel("Section title").last()).toHaveValue(
			"Skills",
		);
		await expect(sidebarSectionTitles(after)).toContainText(["Skills"]);
	});
});
