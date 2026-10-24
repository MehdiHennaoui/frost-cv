/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Cv } from "@/entities/cv";
import { i18n, UiLocaleSwitch, UiLocaleSync } from "@/shared/i18n";
import { CvListPage } from "./cv-list-page";

const sampleCv: Cv = {
	id: "1",
	title: "Frontend CV",
	locale: "fr-CA",
	content: {},
	createdAt: 1_000,
	updatedAt: 1_700_000_000_000,
};

afterEach(async () => {
	cleanup();
	localStorage.clear();
	document.documentElement.lang = "en";
	await i18n.changeLanguage("en");
});

function renderList(cvs: Cv[]) {
	return render(
		<>
			<UiLocaleSync />
			<UiLocaleSwitch />
			<CvListPage cvs={cvs} />
		</>,
	);
}

describe("CV list UI locale", () => {
	it("switches list, create, and delete copy to French", async () => {
		renderList([sampleCv]);

		fireEvent.change(screen.getByLabelText("UI locale"), {
			target: { value: "fr-CA" },
		});

		expect(await screen.findByRole("heading", { name: "Vos CV" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Créer un CV" })).toBeTruthy();
		expect(
			screen.getByText(/Langue du CV : fr-CA · Mis à jour .+/),
		).toBeTruthy();
		expect(document.documentElement.lang).toBe("fr-CA");

		fireEvent.click(screen.getByRole("button", { name: "Créer un CV" }));

		expect(screen.getByRole("heading", { name: "Créer un CV" })).toBeTruthy();
		expect(screen.getByLabelText("Titre")).toBeTruthy();
		expect(screen.getByLabelText("Langue du CV")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: /^Créer le CV$/ }));
		expect((await screen.findByRole("alert")).textContent).toBe(
			"Le titre est obligatoire",
		);
		fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

		fireEvent.click(
			screen.getByRole("button", { name: "Supprimer ce CV : Frontend CV" }),
		);

		expect(
			screen.getByRole("heading", { name: "Supprimer le CV" }),
		).toBeTruthy();
		expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
		expect(
			screen.getByText(
				"Supprimer « Frontend CV » ? Cette action est irréversible.",
			),
		).toBeTruthy();
		expect(screen.getByRole("button", { name: /^Supprimer$/ })).toBeTruthy();
	});

	it("applies a stored French UI locale after mount", async () => {
		localStorage.setItem("frost-cv.ui-locale", "fr-CA");

		renderList([]);

		expect(await screen.findByRole("heading", { name: "Vos CV" })).toBeTruthy();
		expect(screen.getByText("Aucun CV pour le moment.")).toBeTruthy();
		expect(screen.getByLabelText("Langue de l’interface")).toBeTruthy();
		expect(document.documentElement.lang).toBe("fr-CA");
	});
});
