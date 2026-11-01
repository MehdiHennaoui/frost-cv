import { expect, test } from "@playwright/test";

test.describe("React PDF document preview", () => {
	test("editor shows Letter React PDF preview with toolbar, no Print PDF control", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E React PDF CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const preview = page.getByLabel("Canadian CV preview");
		await expect(preview).toBeVisible();
		await expect(preview).toHaveAttribute("data-react-pdf-preview");

		const viewer = preview.locator("iframe");
		await expect(viewer).toBeVisible({ timeout: 15_000 });

		await expect(page.getByRole("button", { name: "Export PDF" })).toHaveCount(
			0,
		);
		await expect(
			page.getByRole("link", { name: "Back to CV list" }),
		).toBeVisible();
	});
});
