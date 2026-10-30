/** @vitest-environment jsdom */

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import {
	SidebarPortalProvider,
	useSidebarPortalHost,
} from "@/shared/lib/sidebar-portal";
import { CvEditorPage } from "./cv-editor-page";

const saveCvMock = vi.fn();

vi.mock("@/entities/cv", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/entities/cv")>();
	return {
		...actual,
		saveCv: (...args: unknown[]) => saveCvMock(...args),
	};
});

afterEach(() => {
	cleanup();
	saveCvMock.mockReset();
});

function HostBinder({ host }: { host: HTMLElement }) {
	const { setHost } = useSidebarPortalHost();

	useEffect(() => {
		setHost(host);
		return () => setHost(null);
	}, [host, setHost]);

	return null;
}

function renderEditor(
	cv: Cv | undefined,
	props: Omit<Parameters<typeof CvEditorPage>[0], "cv"> = {},
) {
	const host = document.createElement("div");
	host.setAttribute("data-testid", "app-sidebar-portal");
	document.body.appendChild(host);

	const view = render(
		<SidebarPortalProvider>
			<HostBinder host={host} />
			<CvEditorPage cv={cv} {...props} />
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
		expect(
			within(host).getByRole("button", { name: "cvEditor.customs.add" }),
		).toBeTruthy();

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

	it("saves a new section order immediately and updates the preview", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		const { host } = renderEditor(sampleCv());

		expect(
			within(host).getByLabelText("cvEditor.identity.field.firstName"),
		).toBeTruthy();
		fireEvent.click(
			within(host).getAllByRole("button", {
				name: "cvEditor.sections.position",
			})[0],
		);
		await act(async () => {
			fireEvent.click(screen.getAllByRole("menuitem")[2]);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.sectionOrder).toEqual([
			"identity",
			"education",
			"languages",
			"experiences",
		]);

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(
			within(preview)
				.getAllByRole("heading", { level: 2 })
				.map((heading) => heading.textContent),
		).toEqual(["Education", "Languages", "Experiences"]);
	});

	it("prints the Canadian preview from the export PDF control", () => {
		const print = vi.spyOn(window, "print").mockImplementation(() => {});
		const { host } = renderEditor(sampleCv());

		fireEvent.click(
			within(host).getByRole("button", { name: "cvExport.print" }),
		);

		expect(print).toHaveBeenCalledOnce();
		print.mockRestore();
	});

	it("exports the current CV as JSON via the download helper", () => {
		const downloadFile = vi.fn();
		const { host } = renderEditor(sampleCv(), { downloadFile });

		fireEvent.click(
			within(host).getByRole("button", { name: "cvExport.export" }),
		);

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

	it("opens replace-import confirmation from the import button", () => {
		const { host } = renderEditor(sampleCv());

		fireEvent.click(
			within(host).getByRole("button", { name: "cvList.import" }),
		);

		expect(
			screen.getByRole("heading", { name: "cvExport.replaceTitle" }),
		).toBeTruthy();
		expect(screen.getByText("cvExport.replaceDescription")).toBeTruthy();
	});

	it("locks fields and reorder while a save is in flight", async () => {
		let release: (cv: Cv) => void = () => {};
		saveCvMock.mockImplementation(
			(next: Cv) =>
				new Promise<Cv>((resolve) => {
					release = () => resolve({ ...next, updatedAt: 2 });
				}),
		);

		const { host } = renderEditor(sampleCv());
		fireEvent.click(
			within(host).getAllByRole("button", {
				name: "cvEditor.sections.position",
			})[0],
		);
		await act(async () => {
			fireEvent.click(screen.getAllByRole("menuitem")[2]);
		});

		expect(within(host).getByText("cvEditor.saving")).toBeTruthy();
		expect(
			within(host)
				.getByLabelText("cvEditor.identity.field.firstName")
				.closest("[inert]"),
		).toBeTruthy();
		expect(
			within(host)
				.getAllByRole("button", { name: "cvEditor.sections.position" })[0]
				?.closest("[inert]"),
		).toBeTruthy();

		await act(async () => {
			release(saveCvMock.mock.calls[0]?.[0] as Cv);
		});

		expect(within(host).queryByText("cvEditor.saving")).toBeNull();
		expect(host.querySelector("[inert]")).toBeNull();
	});
});
