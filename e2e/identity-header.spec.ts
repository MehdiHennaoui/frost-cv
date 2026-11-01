import { expect, test } from "@playwright/test";

import {
	expectReactPdfPreview,
	flushEditorPersist,
	reloadEditor,
} from "./helpers/preview";

test.describe("identity header", () => {
	test("edits a field and keeps it after blur flush", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Identity CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		const firstName = sidebar.getByLabel("First name");
		await firstName.fill("Ada");
		await flushEditorPersist(page);

		await expect(
			page.getByTestId("app-sidebar-portal").getByLabel("First name"),
		).toHaveValue("Ada");
		await expectReactPdfPreview(page);

		await reloadEditor(page);
		await expect(
			page.getByTestId("app-sidebar-portal").getByLabel("First name"),
		).toHaveValue("Ada");
	});
});
