/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Cv } from "@/entities/cv/model/cv";
import { CvListPage } from "./cv-list-page";

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
		locale: "fr-CA",
		content: {},
		createdAt: 2_000,
		updatedAt: 1_600_000_000_000,
	},
];

describe("CvListPage", () => {
	it("shows an empty state when there are no CVs", () => {
		render(<CvListPage cvs={[]} onCreated={() => {}} onDeleted={() => {}} />);

		expect(screen.getByText(/no cvs yet/i)).toBeTruthy();
	});

	it("lists each CV title, locale, and updated time", () => {
		render(
			<CvListPage cvs={sampleCvs} onCreated={() => {}} onDeleted={() => {}} />,
		);

		expect(screen.getByText("Frontend CV")).toBeTruthy();
		expect(screen.getByText("CV Québec")).toBeTruthy();
		expect(screen.getByText(/CV locale: en · Updated/i)).toBeTruthy();
		expect(screen.getByText(/CV locale: fr-CA · Updated/i)).toBeTruthy();
	});

	it("opens the create modal from the Create new CV button", () => {
		render(<CvListPage cvs={[]} onCreated={vi.fn()} onDeleted={vi.fn()} />);

		fireEvent.click(screen.getByRole("button", { name: /create new cv/i }));

		expect(
			screen.getByRole("heading", { name: /create new cv/i }),
		).toBeTruthy();
		expect(screen.getByLabelText(/title/i)).toBeTruthy();
		expect(screen.getByLabelText(/cv locale/i)).toBeTruthy();
	});

	it("opens a delete confirmation naming the CV", () => {
		render(
			<CvListPage cvs={sampleCvs} onCreated={vi.fn()} onDeleted={vi.fn()} />,
		);

		fireEvent.click(
			screen.getByRole("button", { name: /delete frontend cv/i }),
		);

		expect(screen.getByRole("heading", { name: /delete cv/i })).toBeTruthy();
		expect(
			screen.getByText(/Delete “Frontend CV”\? This cannot be undone\./),
		).toBeTruthy();
	});
});
