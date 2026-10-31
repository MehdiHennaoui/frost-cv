import { expect, test } from "@playwright/test";

function pdfPageCount(pdf: Buffer): number {
	const text = pdf.toString("latin1");
	const marked = text.match(/\/Type\s*\/Page\b/g);
	if (marked && marked.length > 0) {
		return marked.length;
	}
	const count = text.match(/\/Count\s+(\d+)/);
	return count ? Number(count[1]) : 0;
}

test.describe("print / PDF Canadian layout", () => {
	test("prints a multi-page Canadian preview without editor chrome", async ({
		page,
	}) => {
		await page.goto("/cvs");
		await page.getByRole("button", { name: "Create new CV" }).click();
		await page.getByLabel("Title").fill("E2E Multi-page Print CV");
		await page.getByRole("button", { name: "Create CV" }).click();
		await expect(page).toHaveURL(/\/cvs\/[^/]+/);

		const cvId = page.url().split("/").pop() ?? "";
		await page.evaluate(async (id) => {
			const open = indexedDB.open("frost-cv");
			const db = await new Promise<IDBDatabase>((resolve, reject) => {
				open.onsuccess = () => resolve(open.result);
				open.onerror = () => reject(open.error);
			});
			const tx = db.transaction("cvs", "readwrite");
			const store = tx.objectStore("cvs");
			const cv = await new Promise<Record<string, unknown>>(
				(resolve, reject) => {
					const req = store.get(id);
					req.onsuccess = () => resolve(req.result as Record<string, unknown>);
					req.onerror = () => reject(req.error);
				},
			);
			const content = {
				...(cv.content as Record<string, unknown>),
				identity: {
					firstName: "Ada",
					lastName: "Lovelace",
					jobTitle: "Analyst",
					email: "ada@example.com",
					phone: "555-0100",
					postalCode: "H2X 1Y4",
					linkedin: "linkedin.com/in/ada",
					github: "",
					website: "",
					description: "<p>Built analytical engines.</p>",
				},
				experiences: Array.from({ length: 12 }, (_, i) => ({
					id: crypto.randomUUID(),
					jobTitle: `Role ${i + 1}`,
					company: `Company ${i + 1}`,
					location: "Montreal, QC",
					startMonth: `${2010 + i}-01`,
					endMonth: `${2010 + i}-12`,
					isCurrent: false,
					description:
						`<p>${"Long bullet describing impact, scope, and delivery. ".repeat(10)}</p>`.repeat(
							2,
						),
				})),
			};
			await new Promise<void>((resolve, reject) => {
				const req = store.put({
					...cv,
					content,
					updatedAt: Date.now(),
				});
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			});
			await new Promise<void>((resolve) => {
				tx.oncomplete = () => resolve();
			});
		}, cvId);

		await page.reload();
		const preview = page.getByLabel("Canadian CV preview");
		await expect(preview.getByText("Role 12 · Company 12")).toBeVisible({
			timeout: 5000,
		});

		const screenHeight = await page.evaluate(() => {
			const article = document.querySelector("[data-cv-preview]");
			return article?.getBoundingClientRect().height ?? 0;
		});
		expect(screenHeight).toBeGreaterThan(11 * 96);

		await page.emulateMedia({ media: "print" });
		const printLayout = await page.evaluate(() => {
			const article = document.querySelector("[data-cv-preview]");
			const sidebar = document.querySelector('[data-slot="sidebar"]');
			const header = document.querySelector(
				'[data-slot="sidebar-inset"] > header',
			);
			const contentAreaPx = (11 - 0.6 * 2) * 96;
			const height = article?.getBoundingClientRect().height ?? 0;
			return {
				sidebarDisplay: sidebar ? getComputedStyle(sidebar).display : null,
				headerDisplay: header ? getComputedStyle(header).display : null,
				estimatedPages: Math.ceil(height / contentAreaPx),
			};
		});
		expect(printLayout.sidebarDisplay).toBe("none");
		expect(printLayout.headerDisplay).toBe("none");
		expect(printLayout.estimatedPages).toBeGreaterThan(1);

		const pdf = Buffer.from(
			await page.pdf({
				printBackground: true,
				preferCSSPageSize: true,
			}),
		);
		const pages = pdfPageCount(pdf);
		expect(pages).toBeGreaterThan(1);

		const pdfText = pdf.toString("latin1");
		expect(pdfText).not.toContain("Export PDF");
		expect(pdfText).not.toContain("Toggle Sidebar");
		// Letter in PDF points: 8.5×11 in → 612×792
		expect(pdfText).toMatch(
			/\/MediaBox\s*\[\s*0\s+0\s+612(\.0)?\s+792(\.0)?\s*\]/,
		);
	});
});
