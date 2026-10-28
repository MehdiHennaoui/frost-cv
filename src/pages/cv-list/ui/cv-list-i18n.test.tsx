/** @vitest-environment jsdom */

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Cv } from "@/entities/cv";
import { changeUiLocale, i18n, UiLocaleSwitch } from "@/shared/i18n";
import { CvListPage } from "./cv-list-page";

const sampleCv: Cv = {
	id: "1",
	title: "Frontend CV",
	locale: "fr",
	content: {},
	createdAt: 1_000,
	updatedAt: 1_700_000_000_000,
};

beforeEach(() => {
	localStorage.clear();
});

afterEach(() => {
	cleanup();
});

function renderList(cvs: Cv[]) {
	return render(
		<>
			<UiLocaleSwitch />
			<CvListPage cvs={cvs} />
		</>,
	);
}

describe("CV list UI locale", () => {
	it("renders list, create, and delete copy as translation keys", async () => {
		renderList([sampleCv]);

		expect(screen.getByRole("button", { name: "cvList.create" })).toBeTruthy();
		expect(screen.getByText("cvList.meta")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "cvList.create" }));

		expect(
			screen.getByRole("heading", { name: "createCv.title" }),
		).toBeTruthy();
		expect(screen.getByLabelText("createCv.fieldTitle")).toBeTruthy();
		expect(screen.getByLabelText("createCv.fieldLocale")).toBeTruthy();
		expect(screen.getByRole("button", { name: "dialog.close" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "createCv.submit" }));
		expect((await screen.findByRole("alert")).textContent).toBe(
			"createCv.titleRequired",
		);
		fireEvent.click(screen.getByRole("button", { name: "createCv.cancel" }));

		const [deleteButton] = screen.getAllByRole("button", {
			name: "cvList.deleteNamed",
		});
		expect(deleteButton).toBeTruthy();
		fireEvent.click(deleteButton);

		expect(
			screen.getByRole("heading", { name: "deleteCv.title" }),
		).toBeTruthy();
		expect(screen.getByText("deleteCv.description")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "deleteCv.confirm" }),
		).toBeTruthy();
	});

	it("persists the selected UI locale in localStorage", async () => {
		renderList([]);

		fireEvent.click(screen.getByRole("button", { name: "uiLocale.label" }));
		fireEvent.click(screen.getByRole("menuitem", { name: /Français/ }));

		await waitFor(() => {
			expect(i18n.language).toBe("fr");
			expect(localStorage.getItem("i18nextLng")).toBe("fr");
		});

		cleanup();
		localStorage.setItem("i18nextLng", "fr");
		await changeUiLocale("fr");
		renderList([]);

		expect(screen.getByText("Aucun CV pour le moment.")).toBeTruthy();
	});
});
