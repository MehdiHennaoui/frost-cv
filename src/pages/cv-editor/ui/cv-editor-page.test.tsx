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

	it("portals section editors into the sidebar host, not the preview", () => {
		const { host } = renderEditor(sampleCv());

		const sections = within(host).getAllByRole("listitem");
		expect(sections.map((el) => el.textContent)).toEqual([
			"cvEditor.section.identity",
			"cvEditor.section.experiences",
			"cvEditor.section.education",
			"cvEditor.section.languages",
			"cvEditor.section.customs",
		]);

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(within(preview).queryByText("cvEditor.section.identity")).toBeNull();
	});

	it("preview shows persisted identity outside the sidebar", () => {
		renderEditor(sampleCv());

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(within(preview).getByText("Ada Lovelace")).toBeTruthy();
		expect(within(preview).getByText("Analyst")).toBeTruthy();
	});
});
