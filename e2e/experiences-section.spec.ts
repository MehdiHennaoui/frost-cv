import { expect, test } from "@playwright/test";

test.describe("experiences section", () => {
	test("adds an experience and shows it in the Canadian preview", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Experiences CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add experience" }).click();

		const jobTitle = sidebar.getByLabel("Job title").last();
		await jobTitle.fill("Software Engineer");
		await sidebar.getByLabel("Company").last().fill("Acme Corp");
		await sidebar.getByLabel("Location").last().fill("Montreal");
		await sidebar.getByLabel("Start month").last().fill("2020-01");
		await jobTitle.blur();

		const preview = page.getByLabel("Canadian CV preview");
		await expect(
			preview.getByText("Software Engineer · Acme Corp"),
		).toBeVisible({
			timeout: 5000,
		});
		await expect(preview.getByText("Montreal")).toBeVisible();
		await expect(preview.getByText("01/2020")).toBeVisible();
	});

	test("shows the date range error on both month fields", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Date Validation CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add experience" }).click();

		await sidebar.getByLabel("Start month").fill("2022-06");
		await sidebar.getByLabel("End month").fill("2021-01");

		await expect(
			sidebar.getByText("End month must be on or after the start month."),
		).toHaveCount(2);
	});
});
