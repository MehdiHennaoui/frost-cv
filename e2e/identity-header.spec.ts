import { expect, test } from "@playwright/test";

test.describe("identity header", () => {
	test("edits a field and updates the Canadian preview after blur flush", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Identity CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		const firstName = sidebar.getByLabel("First name");
		await firstName.fill("Ada");
		await firstName.blur();

		const preview = page.getByLabel("Canadian CV preview");
		await expect(preview.getByRole("heading", { name: "Ada" })).toBeVisible({
			timeout: 5000,
		});
	});
});
