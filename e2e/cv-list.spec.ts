import { expect, test } from "@playwright/test";

test.describe("CV list", () => {
	test("create CV then see it on the list after going back", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E List Create CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);
		await page.getByRole("link", { name: "Back to CV list" }).click();
		await expect(page).toHaveURL(/\/cvs\/?$/);
		await expect(
			page.getByRole("link", { name: "E2E List Create CV" }),
		).toBeVisible();
		await page.reload();
		await expect(
			page.getByRole("link", { name: "E2E List Create CV" }),
		).toBeVisible();
	});

	test("delete CV with confirm removes it from the list", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E List Delete CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		await page.getByRole("link", { name: "Back to CV list" }).click();
		await expect(
			page.getByRole("link", { name: "E2E List Delete CV" }),
		).toBeVisible();

		await page
			.getByRole("button", { name: "Delete this CV: E2E List Delete CV" })
			.click();
		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("heading", { name: "Delete CV" }),
		).toBeVisible();
		await dialog.getByRole("button", { name: "Delete" }).click();

		await expect(
			page.getByRole("link", { name: "E2E List Delete CV" }),
		).toHaveCount(0);
		await page.reload();
		await expect(
			page.getByRole("link", { name: "E2E List Delete CV" }),
		).toHaveCount(0);
	});
});
