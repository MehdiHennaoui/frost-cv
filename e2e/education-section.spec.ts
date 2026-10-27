import { expect, test } from "@playwright/test";

test.describe("education section", () => {
	test("adds an education entry and shows it in the Canadian preview", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Education CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add education" }).click();

		const school = sidebar.getByLabel("School name").last();
		await school.fill("McGill University");
		await sidebar
			.getByLabel("Degree name")
			.last()
			.fill("B.Sc. Computer Science");
		await sidebar.getByLabel("City / country").last().fill("Montreal, Canada");
		await sidebar.getByLabel("Start month").last().fill("2016-09");
		await sidebar.getByLabel("End month").last().fill("2020-05");
		await school.blur();

		const preview = page.getByLabel("Canadian CV preview");
		await expect(
			preview.getByText("B.Sc. Computer Science · McGill University"),
		).toBeVisible({
			timeout: 5000,
		});
		await expect(preview.getByText("Montreal, Canada")).toBeVisible();
		await expect(preview.getByText("09/2016 – 05/2020")).toBeVisible();
	});
});
