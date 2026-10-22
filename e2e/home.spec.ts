import { expect, test } from "@playwright/test";

test("home page shows welcome title", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/TanStack Start Starter/i);
	await expect(
		page.getByRole("heading", { name: "Welcome to TanStack Start" }),
	).toBeVisible();
});
