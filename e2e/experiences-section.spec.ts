import { expect, test } from "@playwright/test";

import {
	expandLastEntry,
	expectReactPdfPreview,
	flushEditorPersist,
	reloadEditor,
} from "./helpers/preview";

test.describe("experiences section", () => {
	test("adds an experience and keeps it after blur flush", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Experiences CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add experience" }).click();
		await expandLastEntry(sidebar);

		await sidebar.getByLabel("Job title").last().fill("Software Engineer");
		await sidebar.getByLabel("Company").last().fill("Acme Corp");
		await sidebar.getByLabel("Location").last().fill("Montreal");
		await sidebar.getByLabel("Start month").last().fill("2020-01");
		await flushEditorPersist(page);

		const filled = page.getByTestId("app-sidebar-portal");
		await expect(filled.getByLabel("Job title").last()).toHaveValue(
			"Software Engineer",
		);
		await expect(filled.getByLabel("Company").last()).toHaveValue("Acme Corp");
		await expectReactPdfPreview(page);

		await reloadEditor(page);
		const after = page.getByTestId("app-sidebar-portal");
		await expandLastEntry(after);
		await expect(after.getByLabel("Job title").last()).toHaveValue(
			"Software Engineer",
		);
		await expect(after.getByLabel("Company").last()).toHaveValue("Acme Corp");
		await expect(after.getByLabel("Location").last()).toHaveValue("Montreal");
		await expect(after.getByLabel("Start month").last()).toHaveValue("2020-01");
	});

	test("shows the date range error on both month fields", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Date Validation CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add experience" }).click();
		await expandLastEntry(sidebar);

		await sidebar.getByLabel("Start month").fill("2022-06");
		await sidebar.getByLabel("End month").fill("2021-01");

		await expect(
			sidebar.getByText("End month must be on or after the start month."),
		).toHaveCount(2);
	});
});
