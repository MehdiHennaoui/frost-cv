import { expect, test } from "@playwright/test";

test.describe("languages section", () => {
	test("adds a language entry and shows it in the Canadian preview", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Languages CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add language" }).click();

		const language = sidebar.getByLabel("Language").last();
		await language.fill("French");
		await sidebar.getByLabel("Level").last().fill("Fluent");
		await language.blur();

		const preview = page.getByLabel("Canadian CV preview");
		await expect(preview.getByText("French — Fluent")).toBeVisible({
			timeout: 5000,
		});
	});
});
