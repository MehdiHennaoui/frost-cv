/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { i18n, useAppTranslation, useStoredUiLocale } from "./instance";

function Probe() {
	useStoredUiLocale();
	const { t } = useAppTranslation();
	return <p>{t("cvEditor.loading")}</p>;
}

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("useStoredUiLocale", () => {
	it("applies the stored locale after mount", async () => {
		localStorage.setItem("i18nextLng", "fr");
		render(<Probe />);

		await waitFor(() => {
			expect(screen.getByText("Chargement du CV…")).toBeTruthy();
		});
		expect(i18n.language).toBe("fr");
	});
});
