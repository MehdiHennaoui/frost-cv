import { expect, type Locator, type Page, test } from "@playwright/test";

import {
	expectReactPdfPreview,
	flushEditorPersist,
	reloadEditor,
} from "./helpers/preview";

test.describe("languages section", () => {
	test("adds a language entry and keeps it after blur flush", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Languages CV");
		await page.getByRole("button", { name: "Create CV" }).click();

		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add language" }).click();

		await sidebar.getByLabel("Language").last().fill("French");
		await sidebar.getByLabel("Level").last().fill("Fluent");
		await flushEditorPersist(page);

		await expectReactPdfPreview(page);

		await reloadEditor(page);
		const after = page.getByTestId("app-sidebar-portal");
		await expect(after.getByLabel("Language").last()).toHaveValue("French");
		await expect(after.getByLabel("Level").last()).toHaveValue("Fluent");
	});

	test("reorders language entries inside the section", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Language Order CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		const language = sidebar.getByRole("textbox", {
			name: "Language",
			exact: true,
		});
		const level = sidebar.getByRole("textbox", { name: "Level", exact: true });
		await sidebar.getByRole("button", { name: "Add language" }).click();
		await language.fill("French");
		await level.fill("Fluent");
		await sidebar.getByRole("button", { name: "Add language" }).click();
		await language.last().fill("English");
		await level.last().fill("Native");
		await flushEditorPersist(page);

		const languageEntries = sidebar
			.locator("[data-slot=card]")
			.filter({ hasText: "Languages" })
			.locator(".rounded-lg.border");
		const firstEntryButtons = languageEntries.first().getByRole("button");
		await expect(firstEntryButtons).toHaveCount(3);
		await expect(firstEntryButtons.nth(0)).toHaveAttribute(
			"aria-label",
			"Delete this language",
		);
		await expect(firstEntryButtons.nth(1)).toHaveAttribute(
			"aria-label",
			"Choose a position",
		);
		await expect(firstEntryButtons.nth(2)).toHaveAttribute(
			"aria-label",
			"Drag to reorder",
		);
		const handles = languageEntries.getByRole("button", {
			name: "Drag to reorder",
		});
		await dragHandleTo(page, handles.nth(1), handles.nth(0));

		await expect(language.nth(0)).toHaveValue("English");
		await expect(language.nth(1)).toHaveValue("French");
		await expect(level.nth(0)).toHaveValue("Native");
		await expect(level.nth(1)).toHaveValue("Fluent");
		await expectReactPdfPreview(page);

		await reloadEditor(page);
		const after = page.getByTestId("app-sidebar-portal");
		const languageAfter = after.getByRole("textbox", {
			name: "Language",
			exact: true,
		});
		const levelAfter = after.getByRole("textbox", {
			name: "Level",
			exact: true,
		});
		await expect(languageAfter.nth(0)).toHaveValue("English");
		await expect(languageAfter.nth(1)).toHaveValue("French");
		await expect(levelAfter.nth(0)).toHaveValue("Native");
		await expect(levelAfter.nth(1)).toHaveValue("Fluent");
	});
});

async function dragHandleTo(page: Page, handle: Locator, target: Locator) {
	await handle.scrollIntoViewIfNeeded();
	const from = await handle.boundingBox();
	const to = await target.boundingBox();
	if (!from || !to) {
		throw new Error("drag handle is not visible");
	}
	const startX = from.x + from.width / 2;
	const startY = from.y + from.height / 2;
	const listTop = await handle.evaluate((node) => {
		const list = node.closest(".gap-4");
		return list?.getBoundingClientRect().top ?? null;
	});
	if (listTop == null) {
		throw new Error("reorder list is not visible");
	}
	await page.mouse.move(startX, startY);
	await page.mouse.down();
	await page.mouse.move(startX + 80, listTop - 200, { steps: 8 });
	const capped = await handle.boundingBox();
	if (!capped) {
		throw new Error("drag handle is not visible");
	}
	expect(capped.y).toBeGreaterThanOrEqual(listTop - 1);
	expect(Math.abs(capped.x - from.x)).toBeLessThan(2);
	await page.mouse.move(startX, to.y + to.height / 2, { steps: 8 });
	await page.mouse.up();
}
