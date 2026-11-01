import { expect, type Locator, type Page } from "@playwright/test";

/** Preview is a React PDF iframe — assert the shell, not DOM text inside the PDF. */
export async function expectReactPdfPreview(page: Page) {
	const preview = page.getByLabel("Canadian CV preview");
	await expect(preview).toBeVisible();
	await expect(preview).toHaveAttribute("data-react-pdf-preview");
	await expect(preview.locator("iframe")).toBeVisible({ timeout: 15_000 });
}

/** Leave the focused field so form-leave flush runs, then wait for IndexedDB persist. */
export async function flushEditorPersist(page: Page) {
	await page.evaluate(() => {
		const active = document.activeElement;
		if (active instanceof HTMLElement) {
			active.blur();
		}
	});
	const saving = page.getByText("Saving CV…");
	await expect(saving).toBeVisible({ timeout: 2000 });
	await expect(saving).toHaveCount(0);
}

export async function reloadEditor(page: Page) {
	await page.reload();
	await expect(page.getByRole("heading", { name: "Loading CV…" })).toHaveCount(
		0,
		{ timeout: 15_000 },
	);
	await expectReactPdfPreview(page);
}

export function sidebarSectionTitles(sidebar: Locator) {
	return sidebar.locator(
		"[data-slot=card] > [data-slot=card-header] [data-slot=card-title]",
	);
}
