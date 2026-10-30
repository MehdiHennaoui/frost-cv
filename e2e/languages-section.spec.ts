import { expect, type Locator, type Page, test } from "@playwright/test";

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
		await level.last().blur();

		const handles = sidebar.getByRole("button", {
			name: "Reorder this language",
		});
		await dragHandleTo(page, handles.nth(1), handles.nth(0));

		const preview = page.getByLabel("Canadian CV preview");
		await expect(preview.getByRole("listitem")).toHaveText([
			"English — Native",
			"French — Fluent",
		]);
		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Experiences",
			"Education",
			"Languages",
		]);
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
	await page.mouse.move(startX, startY);
	await page.mouse.down();
	await page.mouse.move(startX, startY + (to.y - from.y), { steps: 15 });
	await page.mouse.up();
}
