/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import { CvEditorPage } from "./cv-editor-page";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubViewport(isMdUp: boolean) {
	vi.stubGlobal(
		"matchMedia",
		vi.fn((query: string) => ({
			matches: isMdUp,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	);
}

function sampleCv(overrides: Partial<Cv> = {}): Cv {
	return {
		id: "cv-1",
		title: "Frontend CV",
		locale: "en",
		content: {
			...createEmptyCvContent(),
			identity: {
				firstName: "Ada",
				lastName: "Lovelace",
				jobTitle: "Analyst",
			},
		},
		createdAt: 1,
		updatedAt: 1,
		...overrides,
	};
}

describe("CvEditorPage", () => {
	it("shows not-found when the CV is missing", () => {
		stubViewport(true);
		render(<CvEditorPage cv={undefined} />);

		expect(screen.getByText("cvEditor.notFound")).toBeTruthy();
		expect(screen.queryByText("cvEditor.tab.edit")).toBeNull();
	});

	it("lists section placeholders with identity first from persisted order", () => {
		stubViewport(true);
		render(<CvEditorPage cv={sampleCv()} />);

		const sections = screen.getAllByRole("listitem");
		expect(sections.map((el) => el.textContent)).toEqual([
			"cvEditor.section.identity",
			"cvEditor.section.experiences",
			"cvEditor.section.education",
			"cvEditor.section.languages",
			"cvEditor.section.customs",
		]);
	});

	it("preview shows persisted identity, not a draft", () => {
		stubViewport(true);
		render(<CvEditorPage cv={sampleCv()} />);

		expect(screen.getByText("Ada Lovelace")).toBeTruthy();
		expect(screen.getByText("Analyst")).toBeTruthy();
	});

	it("switches mobile tabs between edit and preview", () => {
		stubViewport(false);
		render(<CvEditorPage cv={sampleCv()} />);

		fireEvent.click(screen.getByRole("tab", { name: "cvEditor.tab.preview" }));
		expect(
			screen
				.getByRole("tab", { name: "cvEditor.tab.preview" })
				.getAttribute("data-active"),
		).toBe("");
	});
});
