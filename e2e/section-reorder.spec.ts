import { expect, type Locator, type Page, test } from "@playwright/test";

test.describe("section reorder", () => {
	test("drags a section and keeps the new order after reload", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Section Reorder CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const preview = page.getByRole("article", { name: "Canadian CV preview" });
		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Experiences",
			"Education",
			"Languages",
		]);

		const sidebar = page.getByTestId("app-sidebar-portal");
		const languageActions = sidebar
			.locator("[data-slot=card]")
			.filter({ hasText: "Languages" })
			.locator("[data-slot=card-header]")
			.getByRole("button");
		await expect(languageActions).toHaveCount(3);
		await expect(languageActions.nth(0)).toHaveAttribute(
			"aria-label",
			"Add language",
		);
		await expect(languageActions.nth(1)).toHaveAttribute(
			"aria-label",
			"Choose a position",
		);
		await expect(languageActions.nth(2)).toHaveAttribute(
			"aria-label",
			"Drag to reorder",
		);
		await dragHandleTo(
			page,
			sectionDrag(sidebar, "Languages"),
			sectionDrag(sidebar, "Experiences"),
		);

		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Languages",
			"Experiences",
			"Education",
		]);

		await page.reload();
		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Languages",
			"Experiences",
			"Education",
		]);
	});

	test("drags a tall section by a short move of its handle", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Tall Section Reorder CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add experience" }).click();
		await sidebar.getByRole("button", { name: "Add education" }).click();

		const experiences = sectionDrag(sidebar, "Experiences");
		const education = sectionDrag(sidebar, "Education");
		const from = await experiences.boundingBox();
		const to = await education.boundingBox();
		if (!from || !to) {
			throw new Error("drag handle is not visible");
		}
		expect(to.y - from.y).toBeGreaterThan(400);

		await dragHandleBy(page, experiences, Math.round((to.y - from.y) / 2) + 8);

		const preview = page.getByRole("article", { name: "Canadian CV preview" });
		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Education",
			"Experiences",
			"Languages",
		]);
	});

	test("drags a tall section up into first place", async ({ page }) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Tall Section To Top CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const sidebar = page.getByTestId("app-sidebar-portal");
		await sidebar.getByRole("button", { name: "Add experience" }).click();
		await sidebar.getByRole("button", { name: "Add experience" }).click();
		const experiencesCard = sidebar
			.locator("[data-slot=card]")
			.filter({ hasText: "Experiences" });
		await experiencesCard
			.locator("[data-slot=card-header]")
			.getByRole("button", { name: "Choose a position" })
			.click();
		await page.getByRole("menuitem", { name: "Position 3" }).click();

		const preview = page.getByRole("article", { name: "Canadian CV preview" });
		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Education",
			"Languages",
			"Experiences",
		]);

		await dragHandleTo(
			page,
			sectionDrag(sidebar, "Experiences"),
			sectionDrag(sidebar, "Education"),
		);

		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Experiences",
			"Education",
			"Languages",
		]);
	});
});

function sectionDrag(sidebar: Locator, title: string) {
	return sidebar
		.locator("[data-slot=card]")
		.filter({ hasText: title })
		.locator("[data-slot=card-header]")
		.getByRole("button", { name: "Drag to reorder" });
}

async function dragHandleTo(page: Page, handle: Locator, target: Locator) {
	await handle.scrollIntoViewIfNeeded();
	const from = await handle.boundingBox();
	const to = await target.boundingBox();
	if (!from || !to) {
		throw new Error("drag handle is not visible");
	}
	await dragFrom(page, from, to.y - from.y);
}

async function dragHandleBy(page: Page, handle: Locator, dy: number) {
	await handle.scrollIntoViewIfNeeded();
	const from = await handle.boundingBox();
	if (!from) {
		throw new Error("drag handle is not visible");
	}
	await dragFrom(page, from, dy);
}

async function dragFrom(
	page: Page,
	from: { x: number; y: number; width: number; height: number },
	dy: number,
) {
	const startX = from.x + from.width / 2;
	const startY = from.y + from.height / 2;
	await page.mouse.move(startX, startY);
	await page.mouse.down();
	await page.mouse.move(startX, startY + dy, { steps: 15 });
	await page.mouse.up();
}
