/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import {
	SidebarPortalProvider,
	useSidebarPortalHost,
} from "@/shared/lib/sidebar-portal";
import { CvEditorPage } from "./cv-editor-page";

afterEach(() => {
	cleanup();
});

function HostBinder({ host }: { host: HTMLElement }) {
	const { setHost } = useSidebarPortalHost();

	useEffect(() => {
		setHost(host);
		return () => setHost(null);
	}, [host, setHost]);

	return null;
}

function renderEditor(cv: Cv | undefined) {
	const host = document.createElement("div");
	host.setAttribute("data-testid", "app-sidebar-portal");
	document.body.appendChild(host);

	const view = render(
		<SidebarPortalProvider>
			<HostBinder host={host} />
			<CvEditorPage cv={cv} />
		</SidebarPortalProvider>,
	);

	return { host, ...view };
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
				description: "<p>Built engines</p>",
			},
		},
		createdAt: 1,
		updatedAt: 1,
		...overrides,
	};
}

describe("CvEditorPage", () => {
	it("shows not-found when the CV is missing", () => {
		renderEditor(undefined);

		expect(screen.getByText("cvEditor.notFoundHint")).toBeTruthy();
		expect(screen.queryByLabelText("cvEditor.preview.label")).toBeNull();
	});

	it("portals identity, experiences, education, and languages forms into the sidebar host", () => {
		const { host } = renderEditor(sampleCv());

		expect(
			within(host).getByLabelText("cvEditor.identity.field.firstName"),
		).toBeTruthy();
		expect(within(host).getByDisplayValue("Ada")).toBeTruthy();
		expect(
			within(host).getByRole("button", { name: "cvEditor.experiences.add" }),
		).toBeTruthy();
		expect(
			within(host).getByRole("button", { name: "cvEditor.education.add" }),
		).toBeTruthy();
		expect(
			within(host).getByRole("button", { name: "cvEditor.languages.add" }),
		).toBeTruthy();
		expect(within(host).getByText("cvEditor.section.customs")).toBeTruthy();

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(
			within(preview).queryByLabelText("cvEditor.identity.field.firstName"),
		).toBeNull();
	});

	it("preview shows persisted identity outside the sidebar", () => {
		renderEditor(sampleCv());

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(within(preview).getByText("Ada Lovelace")).toBeTruthy();
		expect(within(preview).getByText("Analyst")).toBeTruthy();
		expect(within(preview).getByText("Built engines")).toBeTruthy();
	});
});
