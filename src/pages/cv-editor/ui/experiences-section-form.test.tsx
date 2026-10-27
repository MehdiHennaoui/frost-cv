/** @vitest-environment jsdom */

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import { ExperiencesSectionForm } from "./experiences-section-form";

const saveCvMock = vi.fn();

vi.mock("@/entities/cv", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/entities/cv")>();
	return {
		...actual,
		saveCv: (...args: unknown[]) => saveCvMock(...args),
	};
});

vi.mock("./rich-text-editor", () => ({
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
			aria-label="cvEditor.experiences.field.description"
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
});

function sampleCv(): Cv {
	return {
		id: "cv-1",
		title: "Frontend CV",
		locale: "en",
		content: {
			...createEmptyCvContent(),
			experiences: [
				{
					id: "exp-1",
					jobTitle: "Engineer",
					company: "Acme",
					location: "Montreal",
					startMonth: "2020-01",
					endMonth: "2021-06",
					isCurrent: false,
					description: "",
				},
			],
		},
		createdAt: 1,
		updatedAt: 1,
	};
}

describe("ExperiencesSectionForm", () => {
	it("debounces experience persistence by 1s", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<ExperiencesSectionForm cv={cv} onPersisted={onPersisted} />);

		fireEvent.change(
			screen.getByLabelText("cvEditor.experiences.field.jobTitle"),
			{
				target: { value: "Senior Engineer" },
			},
		);

		await vi.advanceTimersByTimeAsync(999);
		expect(saveCvMock).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences[0].jobTitle).toBe(
			"Senior Engineer",
		);
		await Promise.resolve();
		expect(onPersisted).toHaveBeenCalled();
	});

	it("flushes pending experience on field blur", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<ExperiencesSectionForm cv={cv} onPersisted={onPersisted} />);

		const jobTitle = screen.getByLabelText(
			"cvEditor.experiences.field.jobTitle",
		);
		fireEvent.change(jobTitle, { target: { value: "Lead" } });
		await act(async () => {
			fireEvent.blur(jobTitle);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(onPersisted).toHaveBeenCalled();
	});

	it("hides end month when current position is checked", () => {
		render(<ExperiencesSectionForm cv={sampleCv()} onPersisted={vi.fn()} />);

		expect(
			screen.getByLabelText("cvEditor.experiences.field.endMonth"),
		).toBeTruthy();

		fireEvent.click(
			screen.getByRole("checkbox", {
				name: "cvEditor.experiences.field.isCurrent",
			}),
		);

		expect(
			screen.queryByLabelText("cvEditor.experiences.field.endMonth"),
		).toBeNull();
	});

	it("adds an experience and persists immediately", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(<ExperiencesSectionForm cv={cv} onPersisted={vi.fn()} />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole("button", { name: "cvEditor.experiences.add" }),
			);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences).toHaveLength(2);
	});

	it("deletes an experience after confirmation", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(<ExperiencesSectionForm cv={cv} onPersisted={vi.fn()} />);

		fireEvent.click(
			screen.getByRole("button", { name: "cvEditor.experiences.delete" }),
		);
		const dialog = screen.getByRole("dialog");
		await act(async () => {
			fireEvent.click(
				within(dialog).getByRole("button", {
					name: "cvEditor.experiences.deleteConfirm",
				}),
			);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.experiences).toEqual([]);
	});

	it("blocks autosave and shows an error when end is before start", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<ExperiencesSectionForm cv={cv} onPersisted={vi.fn()} />);

		fireEvent.change(
			screen.getByLabelText("cvEditor.experiences.field.endMonth"),
			{
				target: { value: "2019-01" },
			},
		);

		expect(
			screen.getAllByText("cvEditor.experiences.errors.endBeforeStart"),
		).toHaveLength(2);

		await vi.advanceTimersByTimeAsync(1000);
		await act(async () => {
			fireEvent.blur(
				screen.getByLabelText("cvEditor.experiences.field.endMonth"),
			);
		});
		expect(saveCvMock).not.toHaveBeenCalled();
	});

	it("moves an experience via the position select", async () => {
		const cv = sampleCv();
		cv.content.experiences = [
			...(cv.content.experiences as object[]),
			{
				id: "exp-2",
				jobTitle: "Intern",
				company: "Beta",
				location: "",
				startMonth: "2019-01",
				endMonth: "2019-12",
				isCurrent: false,
				description: "",
			},
		];
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(<ExperiencesSectionForm cv={cv} onPersisted={vi.fn()} />);

		await act(async () => {
			fireEvent.change(
				screen.getAllByLabelText("cvEditor.experiences.position")[0],
				{ target: { value: "1" } },
			);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(
			saveCvMock.mock.calls[0]?.[0].content.experiences.map(
				(e: { id: string }) => e.id,
			),
		).toEqual(["exp-2", "exp-1"]);
	});

	it("shows an explicit delete label on the delete control", () => {
		render(<ExperiencesSectionForm cv={sampleCv()} onPersisted={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "cvEditor.experiences.delete" }),
		).toBeTruthy();
	});
});
