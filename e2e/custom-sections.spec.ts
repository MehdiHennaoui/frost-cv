import { expect, test } from "@playwright/test";

test.describe("custom sections", () => {
	test("adds a custom section and shows it in the Canadian preview", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Custom Sections CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add custom section" }).click();

		const title = sidebar.getByLabel("Section title").last();
		await title.fill("Skills");
		await title.blur();

		const preview = page.getByLabel("Canadian CV preview");
		await expect(preview.getByRole("heading", { name: "Skills" })).toBeVisible({
			timeout: 5000,
		});
	});
});
