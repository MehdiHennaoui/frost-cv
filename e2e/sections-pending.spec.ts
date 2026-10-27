import { test } from "@playwright/test";

// Happy-paths once tickets 08 / 09 / 10 ship. Keep skipped so CI stays green.
test.describe("editor sections (pending product)", () => {
	test.skip("education: add entry appears in Canadian preview", async () => {
		// Implement when ticket 08 ships.
	});

	test.skip("languages: add entry appears in Canadian preview", async () => {
		// Implement when ticket 09 ships.
	});

	test.skip("custom section: add section appears in Canadian preview", async () => {
		// Implement when ticket 10 ships.
	});
});
