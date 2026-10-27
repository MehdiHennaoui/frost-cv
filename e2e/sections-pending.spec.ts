import { test } from "@playwright/test";

// Happy-paths once tickets 09 / 10 ship. Keep skipped so CI stays green.
// Education lives in e2e/education-section.spec.ts (ticket 08).
test.describe("editor sections (pending product)", () => {
	test.skip("languages: add entry appears in Canadian preview", async () => {
		// Implement when ticket 09 ships.
	});

	test.skip("custom section: add section appears in Canadian preview", async () => {
		// Implement when ticket 10 ships.
	});
});
