/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Cv } from "@/entities/cv";
import { CvListPage } from "./cv-list-page";

vi.mock("../model/use-cv-list-navigation", () => ({
	useCvListNavigation: () => ({
		onCreated: vi.fn(),
		onDeleted: vi.fn(),
	}),
}));

afterEach(() => {
	cleanup();
});

const sampleCvs: Cv[] = [
	{
		id: "1",
		title: "Frontend CV",
		locale: "en",
		content: {},
		createdAt: 1_000,
		updatedAt: 1_700_000_000_000,
	},
	{
		id: "2",
		title: "CV Québec",
		locale: "fr",
		content: {},
		createdAt: 2_000,
		updatedAt: 1_600_000_000_000,
	},
];

describe("CvListPage", () => {
	it("shows an empty state when there are no CVs", () => {
		render(<CvListPage cvs={[]} />);

		expect(screen.getByText("cvList.empty")).toBeTruthy();
	});

	it("lists each CV title, locale, and updated time", () => {
		render(<CvListPage cvs={sampleCvs} />);

		expect(screen.getByText("Frontend CV")).toBeTruthy();
		expect(screen.getByText("CV Québec")).toBeTruthy();
		expect(screen.getAllByText(/^cvList\.meta$/).length).toBe(2);
	});

	it("opens the create modal from the Create new CV button", () => {
		render(<CvListPage cvs={[]} />);

		fireEvent.click(screen.getByRole("button", { name: "cvList.create" }));

		expect(
			screen.getByRole("heading", { name: "createCv.title" }),
		).toBeTruthy();
		expect(screen.getByLabelText("createCv.fieldTitle")).toBeTruthy();
		expect(screen.getByLabelText("createCv.fieldLocale")).toBeTruthy();
	});

	it("opens the import modal from the Import JSON button", () => {
		render(<CvListPage cvs={[]} />);

		fireEvent.click(screen.getByRole("button", { name: "cvList.import" }));

		expect(
			screen.getByRole("heading", { name: "cvExport.importTitle" }),
		).toBeTruthy();
		expect(screen.getByText("cvExport.importDescription")).toBeTruthy();
	});

	it("opens a delete confirmation naming the CV", () => {
		render(<CvListPage cvs={sampleCvs} />);

		const [deleteButton] = screen.getAllByRole("button", {
			name: "cvList.deleteNamed",
		});
		expect(deleteButton).toBeTruthy();
		fireEvent.click(deleteButton);

		expect(
			screen.getByRole("heading", { name: "deleteCv.title" }),
		).toBeTruthy();
		expect(screen.getByText("deleteCv.description")).toBeTruthy();
	});

	it("exports a CV from its card via the download helper", () => {
		const downloadFile = vi.fn();
		render(<CvListPage cvs={sampleCvs} downloadFile={downloadFile} />);

		const [exportButton] = screen.getAllByRole("button", {
			name: "cvList.exportNamed",
		});
		fireEvent.click(exportButton);

		expect(downloadFile).toHaveBeenCalledTimes(1);
		expect(downloadFile.mock.calls[0]?.[0]).toBe("Frontend-CV.json");
		expect(JSON.parse(downloadFile.mock.calls[0]?.[1] as string)).toEqual(
			expect.objectContaining({
				schemaVersion: 1,
				title: "Frontend CV",
				locale: "en",
			}),
		);
	});
});
