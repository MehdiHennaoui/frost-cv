/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import { CanadianCvPreview } from "./canadian-cv-preview";

afterEach(() => {
	cleanup();
});

function sampleCv(overrides: Partial<Cv> = {}): Cv {
	return {
		id: "cv-1",
		title: "Frontend CV",
		locale: "en",
		content: createEmptyCvContent(),
		createdAt: 1,
		updatedAt: 1,
		...overrides,
	};
}

describe("CanadianCvPreview experiences", () => {
	it("lists persisted experiences with Present for current roles", () => {
		render(
			<CanadianCvPreview
				cv={sampleCv({
					content: {
						...createEmptyCvContent(),
						experiences: [
							{
								id: "exp-1",
								jobTitle: "Engineer",
								company: "Acme",
								location: "Montreal",
								startMonth: "2020-01",
								endMonth: "",
								isCurrent: true,
								description: "<p>Shipped features</p>",
							},
						],
					},
				})}
			/>,
		);

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(within(preview).getByText("Engineer · Acme")).toBeTruthy();
		expect(within(preview).getByText("Jan 2020 – Present")).toBeTruthy();
		expect(within(preview).getByText("Montreal")).toBeTruthy();
		expect(within(preview).getByText("Shipped features")).toBeTruthy();
	});

	it("shows Présent when the CV locale is fr", () => {
		render(
			<CanadianCvPreview
				cv={sampleCv({
					locale: "fr",
					content: {
						...createEmptyCvContent(),
						experiences: [
							{
								id: "exp-1",
								jobTitle: "Ingénieure",
								company: "Acme",
								location: "",
								startMonth: "2020-01",
								endMonth: "",
								isCurrent: true,
								description: "",
							},
						],
					},
				})}
			/>,
		);

		expect(screen.getByText("janv. 2020 – Présent")).toBeTruthy();
	});
});

describe("CanadianCvPreview section labels", () => {
	it("follows the CV locale when the UI locale differs", () => {
		render(<CanadianCvPreview cv={sampleCv({ locale: "fr" })} />);

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(
			within(preview)
				.getAllByRole("heading", { level: 2 })
				.map((heading) => heading.textContent),
		).toEqual(["Expériences", "Formation", "Langues"]);
	});
});

describe("CanadianCvPreview custom sections", () => {
	it("renders each custom section title and sanitized HTML body", () => {
		render(
			<CanadianCvPreview
				cv={sampleCv({
					content: {
						...createEmptyCvContent(),
						customSections: [
							{
								id: "c1",
								title: "Skills",
								description: "<p>Rust</p><script>alert(1)</script>",
							},
						],
						sectionOrder: [
							"identity",
							"experiences",
							"education",
							"languages",
							"custom:c1",
						],
					},
				})}
			/>,
		);

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(within(preview).getByText("Skills")).toBeTruthy();
		expect(within(preview).getByText("Rust")).toBeTruthy();
		expect(preview.innerHTML).not.toContain("<script>");
	});
});
