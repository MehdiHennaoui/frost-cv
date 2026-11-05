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
import { toast } from "@/shared/ui/toast";
import { CvEditorPage } from "./cv-editor-page";

const saveCvMock = vi.fn();

vi.mock("@/entities/cv", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/entities/cv")>();
	return {
		...actual,
		saveCv: (...args: unknown[]) => saveCvMock(...args),
	};
});

vi.mock("@/shared/ui/toast", () => ({
	toast: {
		add: vi.fn(),
	},
}));

vi.mock("./editors/rich-text-editor", () => ({
	RichTextEditor: ({
		id,
		value,
		onChange,
		onBlur,
	}: {
		id?: string;
		value: string;
		onChange: (html: string) => void;
		onBlur?: () => void;
	}) => (
		<textarea
			id={id}
			aria-label={id}
			value={value}
			onBlur={onBlur}
			onChange={(event) => onChange(event.target.value)}
		/>
	),
}));

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	saveCvMock.mockReset();
	vi.mocked(toast.add).mockClear();
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

	it("flushes a new section order when the editor unmounts", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		const { host, unmount } = renderEditor(sampleCv());

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
		expect(saveCvMock).not.toHaveBeenCalled();

		await act(async () => {
			unmount();
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

	it("opens the Go to command palette from the sidebar header", () => {
		const { host } = renderEditor(sampleCv());

		fireEvent.click(
			within(host).getByRole("button", { name: /cvEditor\.goTo\.open/ }),
		);

		expect(
			screen.getByPlaceholderText("cvEditor.goTo.placeholder"),
		).toBeTruthy();
		expect(
			screen.getByRole("option", { name: "cvEditor.section.identity" }),
		).toBeTruthy();
		expect(
			screen.getByRole("option", { name: "cvEditor.section.experiences" }),
		).toBeTruthy();
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

	it("writes the latest field value once after 1s idle", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);

		fireEvent.change(firstName, { target: { value: "Augusta" } });
		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(999);
		});
		expect(saveCvMock).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.identity.firstName).toBe(
			"Grace",
		);
		expect(
			screen
				.getByLabelText("cvEditor.preview.label")
				.getAttribute("data-updated-at"),
		).toBe("2");
	});

	it("keeps focus hops inside the editor on the debounce", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);
		const lastName = within(host).getByLabelText(
			"cvEditor.identity.field.lastName",
		);

		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			fireEvent.blur(firstName, { relatedTarget: lastName });
		});
		expect(saveCvMock).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
	});

	it("flushes when focus moves to a control outside the form", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);
		const exportButton = within(host).getByRole("button", {
			name: "cvExport.export",
		});

		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			fireEvent.blur(firstName, { relatedTarget: exportButton });
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
	});

	it("saves a new experience after the debounce", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());

		await act(async () => {
			fireEvent.click(
				within(host).getByRole("button", {
					name: "cvEditor.experiences.add",
				}),
			);
		});
		expect(saveCvMock).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences).toHaveLength(1);
	});

	it("deletes an experience after the debounce", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const cv = sampleCv();
		cv.content.experiences = [
			{
				id: "exp-1",
				jobTitle: "Engineer",
				company: "Acme",
				location: "",
				startMonth: "2020-01",
				endMonth: "2021-06",
				isCurrent: false,
				description: "",
			},
		];
		const { host } = renderEditor(cv);

		fireEvent.click(
			within(host).getByRole("button", { name: "cvEditor.experiences.delete" }),
		);
		const dialog = screen.getByRole("dialog");
		await act(async () => {
			fireEvent.click(
				within(dialog).getByRole("button", {
					name: "cvEditor.experiences.deleteConfirm",
				}),
			);
		});
		expect(saveCvMock).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences).toEqual([]);
	});

	it("flushes a pending draft when focus leaves the editor", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);

		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			fireEvent.blur(firstName);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.identity.firstName).toBe(
			"Grace",
		);
	});

	it("flushes a pending draft when the editor unmounts", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host, unmount } = renderEditor(sampleCv());
		fireEvent.change(
			within(host).getByLabelText("cvEditor.identity.field.firstName"),
			{ target: { value: "Grace" } },
		);

		await act(async () => {
			unmount();
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.identity.firstName).toBe(
			"Grace",
		);
	});

	it("skips an invalid month, toasts once per episode, and logs every skip", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const cv = sampleCv({
			content: {
				...createEmptyCvContent(),
				experiences: [
					{
						id: "exp-1",
						jobTitle: "Engineer",
						company: "Acme",
						location: "",
						startMonth: "March 2020",
						endMonth: "2021-01",
						isCurrent: false,
						description: "",
					},
				],
			},
		});
		const { host } = renderEditor(cv);
		fireEvent.click(
			within(host).getByRole("button", { name: "cvEditor.entry.expand" }),
		);
		const jobTitle = within(host).getByLabelText(
			"cvEditor.experiences.field.jobTitle",
		);

		fireEvent.change(jobTitle, { target: { value: "Lead" } });
		expect(within(host).getByText("cvEditor.month.invalid")).toBeTruthy();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		fireEvent.change(jobTitle, { target: { value: "Staff" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(saveCvMock).not.toHaveBeenCalled();
		expect(toast.add).toHaveBeenCalledTimes(1);
		expect(toast.add).toHaveBeenCalledWith({
			type: "error",
			title: "cvEditor.save.invalid",
		});
		expect(errorSpy).toHaveBeenCalledTimes(2);
		expect(
			screen
				.getByLabelText("cvEditor.preview.label")
				.getAttribute("data-updated-at"),
		).toBe("1");

		fireEvent.change(
			within(host).getByLabelText("cvEditor.experiences.field.startMonth"),
			{ target: { value: "2020-01" } },
		);
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);

		fireEvent.change(
			within(host).getByLabelText("cvEditor.experiences.field.endMonth"),
			{ target: { value: "2019-01" } },
		);
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(toast.add).toHaveBeenCalledTimes(2);
		errorSpy.mockRestore();
	});

	it("keeps structure edits in the form until the next valid save", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 4,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const cv = sampleCv({
			content: {
				...createEmptyCvContent(),
				experiences: [
					{
						id: "exp-1",
						jobTitle: "Engineer",
						company: "Acme",
						location: "",
						startMonth: "2020-01",
						endMonth: "2021-06",
						isCurrent: false,
						description: "",
					},
				],
			},
		});
		const { host } = renderEditor(cv);
		fireEvent.click(
			within(host).getByRole("button", { name: "cvEditor.entry.expand" }),
		);
		fireEvent.change(
			within(host).getByLabelText("cvEditor.experiences.field.endMonth"),
			{ target: { value: "2019-01" } },
		);
		await act(async () => {
			fireEvent.click(
				within(host).getByRole("button", { name: "cvEditor.experiences.add" }),
			);
		});

		expect(saveCvMock).not.toHaveBeenCalled();
		expect(
			within(host).getAllByRole("button", { name: "cvEditor.entry.expand" }),
		).toHaveLength(1);
		expect(
			within(host).getAllByRole("button", { name: "cvEditor.entry.collapse" }),
		).toHaveLength(1);
		expect(
			screen
				.getByLabelText("cvEditor.preview.label")
				.getAttribute("data-updated-at"),
		).toBe("1");

		fireEvent.change(
			within(host).getByLabelText("cvEditor.experiences.field.endMonth"),
			{ target: { value: "2021-06" } },
		);
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences).toHaveLength(2);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences[0].endMonth).toBe(
			"2021-06",
		);
	});

	it("serializes overlapping saves so the latest valid values win", async () => {
		let releaseFirst: (() => void) | undefined;
		saveCvMock.mockImplementation(
			(next: Cv) =>
				new Promise<Cv>((resolve) => {
					if (!releaseFirst) {
						releaseFirst = () => resolve({ ...next, updatedAt: 2 });
						return;
					}
					resolve({ ...next, updatedAt: 3 });
				}),
		);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);

		fireEvent.change(firstName, { target: { value: "Augusta" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.identity.firstName).toBe(
			"Augusta",
		);

		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);

		await act(async () => {
			releaseFirst?.();
		});

		expect(saveCvMock).toHaveBeenCalledTimes(2);
		expect(saveCvMock.mock.calls[1]?.[0].content.identity.firstName).toBe(
			"Grace",
		);
	});

	it("keeps form values and the preview when saveCv rejects", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		saveCvMock.mockRejectedValue(new Error("disk full"));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv());
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);

		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(toast.add).toHaveBeenCalledWith({
			type: "error",
			title: "cvEditor.save.failed",
		});
		expect(errorSpy).toHaveBeenCalled();
		expect((firstName as HTMLInputElement).value).toBe("Grace");
		expect(
			screen
				.getByLabelText("cvEditor.preview.label")
				.getAttribute("data-updated-at"),
		).toBe("1");
		errorSpy.mockRestore();
	});

	it("resets the form from a replace-import and drops the previous draft", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		const replaceCvFromImport = vi.fn(
			async (
				_id: string,
				payload: { title: string; locale: "en" | "fr"; content: Cv["content"] },
			) => ({
				id: "cv-1",
				title: payload.title,
				locale: payload.locale,
				content: payload.content,
				createdAt: 1,
				updatedAt: 9,
			}),
		);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const { host } = renderEditor(sampleCv(), { replaceCvFromImport });
		const firstName = within(host).getByLabelText(
			"cvEditor.identity.field.firstName",
		);
		fireEvent.change(firstName, { target: { value: "Drafty" } });

		fireEvent.click(
			within(host).getByRole("button", { name: "cvExport.replace" }),
		);
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const text = JSON.stringify({
			schemaVersion: 1,
			title: "Replacement",
			locale: "fr",
			content: {
				...createEmptyCvContent(),
				identity: {
					...(createEmptyCvContent().identity as object),
					firstName: "Grace",
					lastName: "Hopper",
				},
			},
		});
		fireEvent.change(input, {
			target: {
				files: [new File([text], "cv.json", { type: "application/json" })],
			},
		});
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});
		fireEvent.click(
			screen.getByRole("button", { name: "cvExport.replaceConfirm" }),
		);
		await act(async () => {
			await Promise.resolve();
		});

		expect(replaceCvFromImport).toHaveBeenCalledTimes(1);
		expect(
			(
				within(host).getByLabelText(
					"cvEditor.identity.field.firstName",
				) as HTMLInputElement
			).value,
		).toBe("Grace");
		expect(
			screen
				.getByLabelText("cvEditor.preview.label")
				.getAttribute("data-updated-at"),
		).toBe("9");
	});

	it("keeps a description on its experience when that entry is reordered", async () => {
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		const cv = sampleCv({
			content: {
				...createEmptyCvContent(),
				experiences: [
					{
						id: "exp-1",
						jobTitle: "Engineer",
						company: "Acme",
						location: "",
						startMonth: "2020-01",
						endMonth: "2021-06",
						isCurrent: false,
						description: "<p>First</p>",
					},
					{
						id: "exp-2",
						jobTitle: "Intern",
						company: "Beta",
						location: "",
						startMonth: "2019-01",
						endMonth: "2019-12",
						isCurrent: false,
						description: "<p>Second</p>",
					},
				],
			},
		});
		const { host } = renderEditor(cv);
		fireEvent.click(
			within(host).getAllByRole("button", {
				name: "cvEditor.entry.expandAll",
			})[0],
		);
		const firstDescription = within(host).getByLabelText(
			"experience-exp-1-description",
		);
		fireEvent.change(firstDescription, {
			target: { value: "<p>Still first</p>" },
		});
		fireEvent.click(
			within(host).getAllByRole("button", {
				name: "cvEditor.experiences.position",
			})[0],
		);
		await act(async () => {
			fireEvent.click(screen.getAllByRole("menuitem")[1]);
		});

		expect(
			(
				within(host).getByLabelText(
					"experience-exp-1-description",
				) as HTMLTextAreaElement
			).value,
		).toBe("<p>Still first</p>");
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		const saved = saveCvMock.mock.calls[0]?.[0].content.experiences as Array<{
			id: string;
			description: string;
		}>;
		expect(saved.map((entry) => entry.id)).toEqual(["exp-2", "exp-1"]);
		expect(saved.find((entry) => entry.id === "exp-1")?.description).toBe(
			"<p>Still first</p>",
		);
	});
});
