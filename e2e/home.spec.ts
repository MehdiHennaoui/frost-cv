import { expect, test } from "@playwright/test";

test("root redirects to CV list empty state", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveURL(/\/cvs\/?$/);
	await expect(page).toHaveTitle(/Frost CV/i);
	await expect(page.getByRole("heading", { name: "Your CVs" })).toBeVisible();
	await expect(page.getByText(/no cvs yet/i)).toBeVisible();
});
