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
		await dragHandleTo(
			page,
			sidebar.getByRole("button", { name: "Reorder Languages" }),
			sidebar.getByRole("button", { name: "Reorder Experiences" }),
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
		await sidebar.getByRole("button", { name: "Add experience" }).click();

		const gap = await page.evaluate(() => {
			const top = (name: string) => {
				const button = [...document.querySelectorAll("button")].find(
					(item) => item.getAttribute("aria-label") === name,
				);
				return button?.getBoundingClientRect().top;
			};
			const from = top("Reorder Experiences");
			const to = top("Reorder Education");
			if (from == null || to == null) {
				throw new Error("drag handle is not visible");
			}
			return to - from;
		});
		expect(gap).toBeGreaterThan(400);

		await dragHandleBy(
			page,
			sidebar.getByRole("button", { name: "Reorder Experiences" }),
			Math.round(gap / 2),
		);

		const preview = page.getByRole("article", { name: "Canadian CV preview" });
		await expect(preview.getByRole("heading", { level: 2 })).toHaveText([
			"Education",
			"Experiences",
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
