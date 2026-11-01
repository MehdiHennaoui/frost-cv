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
	vi.useRealTimers();
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

	it("preview hosts the React PDF document (stubbed in tests)", () => {
		renderEditor(sampleCv());

		const preview = screen.getByLabelText("cvEditor.preview.label");
		expect(preview.hasAttribute("data-react-pdf-preview")).toBe(true);
		expect(
			within(preview).getByText("React PDF document preview"),
		).toBeTruthy();
		expect(
			within(preview).queryByLabelText("cvEditor.identity.field.firstName"),
		).toBeNull();
	});

	it("saves a new section order immediately", async () => {
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
	});

	it("puts back-to-list with the top sidebar actions and drops Print PDF", () => {
		const { host } = renderEditor(sampleCv());

		expect(
			within(host).getByRole("link", { name: "cvEditor.backToList" }),
		).toBeTruthy();
		expect(host.querySelector(".border-t")).toBeNull();
		expect(
			within(host).queryByRole("button", { name: "cvExport.print" }),
		).toBeNull();
	});

	it("exports the current CV as JSON via the download helper", () => {
		const downloadFile = vi.fn();
		const { host } = renderEditor(sampleCv(), { downloadFile });

		fireEvent.click(
			within(host).getByRole("button", { name: "cvExport.export" }),
		);

		expect(downloadFile).toHaveBeenCalledTimes(1);
		expect(downloadFile.mock.calls[0]?.[0]).toBe(
			"ada-lovelace-analyst-en.json",
		);
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
			within(host).getByRole("button", { name: "cvExport.replace" }),
		);

		expect(
			screen.getByRole("heading", { name: "cvExport.replaceTitle" }),
		).toBeTruthy();
		expect(screen.getByText("cvExport.replaceDescription")).toBeTruthy();
	});

	it("keeps the focused field editable while a draft persists", async () => {
		let release: (cv: Cv) => void = () => {};
		saveCvMock.mockImplementation(
			(next: Cv) =>
				new Promise<Cv>((resolve) => {
					release = () => resolve({ ...next, updatedAt: 2 });
				}),
		);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);
		firstName.focus();
		fireEvent.change(firstName, { target: { value: "Augusta" } });

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(within(host).getByText("cvEditor.saving")).toBeTruthy();
		expect(document.activeElement).toBe(firstName);
		expect(firstName.closest("[inert]")).toBeNull();
		expect(firstName.closest("[aria-busy='true']")).toBeNull();
		expect((firstName as HTMLInputElement).disabled).toBe(false);

		fireEvent.change(firstName, { target: { value: "Augusta Ada" } });
		expect((firstName as HTMLInputElement).value).toBe("Augusta Ada");

		await act(async () => {
			release(saveCvMock.mock.calls[0]?.[0] as Cv);
		});

		expect(within(host).queryByText("cvEditor.saving")).toBeNull();
		expect(document.activeElement).toBe(firstName);
	});

	it("blocks section reorder, add, export, and import while a draft persists", async () => {
		let release: (cv: Cv) => void = () => {};
		saveCvMock.mockImplementation(
			(next: Cv) =>
				new Promise<Cv>((resolve) => {
					release = () => resolve({ ...next, updatedAt: 2 });
				}),
		);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		const { host } = renderEditor(sampleCv());
		fireEvent.change(
			within(host).getByLabelText("cvEditor.identity.field.firstName"),
			{ target: { value: "Augusta" } },
		);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(within(host).getByText("cvEditor.saving")).toBeTruthy();
		for (const name of [
			"cvEditor.sections.position",
			"cvEditor.sections.drag",
			"cvEditor.customs.add",
			"cvExport.export",
			"cvExport.replace",
		]) {
			for (const control of within(host).getAllByRole("button", { name })) {
				expect((control as HTMLButtonElement).disabled).toBe(true);
			}
		}

		await act(async () => {
			release(saveCvMock.mock.calls[0]?.[0] as Cv);
		});

		expect(within(host).queryByText("cvEditor.saving")).toBeNull();
		for (const name of [
			"cvEditor.sections.position",
			"cvEditor.sections.drag",
			"cvEditor.customs.add",
			"cvExport.export",
			"cvExport.replace",
		]) {
			for (const control of within(host).getAllByRole("button", { name })) {
				expect((control as HTMLButtonElement).disabled).toBe(false);
			}
		}
	});

	it("blocks editing while replace-import is open", () => {
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);

		fireEvent.click(
			within(host).getByRole("button", { name: "cvExport.replace" }),
		);

		expect(
			screen.getByRole("heading", { name: "cvExport.replaceTitle" }),
		).toBeTruthy();
		expect(firstName.closest("[inert]")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "cvExport.cancel" }));

		expect(
			screen.queryByRole("heading", { name: "cvExport.replaceTitle" }),
		).toBeNull();
		expect(firstName.closest("[inert]")).toBeNull();
	});
});
