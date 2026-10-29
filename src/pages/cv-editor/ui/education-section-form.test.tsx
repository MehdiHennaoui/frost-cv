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
import { EducationSectionForm } from "./education-section-form";

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

function sampleCv(): Cv {
	return {
		id: "cv-1",
		title: "Frontend CV",
		locale: "en",
		content: {
			...createEmptyCvContent(),
			education: [
				{
					id: "edu-1",
					school: "McGill",
					degree: "B.Sc.",
					location: "Montreal, Canada",
					startMonth: "2016-09",
					endMonth: "2020-05",
				},
			],
		},
		createdAt: 1,
		updatedAt: 1,
	};
}

describe("EducationSectionForm", () => {
	it("debounces education persistence by 1s", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<EducationSectionForm cv={cv} onPersisted={onPersisted} />);

		fireEvent.change(screen.getByLabelText("cvEditor.education.field.school"), {
			target: { value: "Concordia" },
		});

		await vi.advanceTimersByTimeAsync(999);
		expect(saveCvMock).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.education[0].school).toBe(
			"Concordia",
		);
		await Promise.resolve();
		expect(onPersisted).toHaveBeenCalled();
	});

	it("flushes pending education on field blur", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<EducationSectionForm cv={cv} onPersisted={onPersisted} />);

		const school = screen.getByLabelText("cvEditor.education.field.school");
		fireEvent.change(school, { target: { value: "UdeM" } });
		await act(async () => {
			fireEvent.blur(school);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(onPersisted).toHaveBeenCalled();
	});

	it("adds an education entry and persists immediately", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(<EducationSectionForm cv={cv} onPersisted={vi.fn()} />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole("button", { name: "cvEditor.education.add" }),
			);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.education).toHaveLength(2);
	});

	it("deletes an education entry after confirmation", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(<EducationSectionForm cv={cv} onPersisted={vi.fn()} />);

		fireEvent.click(
			screen.getByRole("button", { name: "cvEditor.education.delete" }),
		);
		const dialog = screen.getByRole("dialog");
		await act(async () => {
			fireEvent.click(
				within(dialog).getByRole("button", {
					name: "cvEditor.education.deleteConfirm",
				}),
			);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.education).toEqual([]);
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

		render(<EducationSectionForm cv={cv} onPersisted={vi.fn()} />);

		fireEvent.change(
			screen.getByLabelText("cvEditor.education.field.endMonth"),
			{
				target: { value: "2015-01" },
			},
		);

		expect(
			screen.getAllByText("cvEditor.education.errors.endBeforeStart"),
		).toHaveLength(2);

		await vi.advanceTimersByTimeAsync(1000);
		await act(async () => {
			fireEvent.blur(
				screen.getByLabelText("cvEditor.education.field.endMonth"),
			);
		});
		expect(saveCvMock).not.toHaveBeenCalled();
	});

	it("moves an education entry via the position select", async () => {
		const cv = sampleCv();
		cv.content.education = [
			...(cv.content.education as object[]),
			{
				id: "edu-2",
				school: "UQAM",
				degree: "Certificate",
				location: "",
				startMonth: "2015-01",
				endMonth: "2015-12",
			},
		];
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(<EducationSectionForm cv={cv} onPersisted={vi.fn()} />);

		fireEvent.click(
			screen.getAllByRole("button", { name: "cvEditor.education.position" })[0],
		);
		await act(async () => {
			fireEvent.click(screen.getAllByRole("menuitem")[1]);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(
			saveCvMock.mock.calls[0]?.[0].content.education.map(
				(e: { id: string }) => e.id,
			),
		).toEqual(["edu-2", "edu-1"]);
	});
});
