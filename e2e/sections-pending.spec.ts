import { test } from "@playwright/test";

// Happy-path once ticket 10 ships. Keep skipped so CI stays green.
// Languages live in e2e/languages-section.spec.ts (ticket 09).
test.describe("editor sections (pending product)", () => {
	test.skip("custom section: add section appears in Canadian preview", async () => {
		// Implement when ticket 10 ships.
	});
});
