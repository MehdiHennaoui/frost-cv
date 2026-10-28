/** @vitest-environment jsdom */

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import { CustomSectionForm } from "./custom-section-form";

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
			aria-label="cvEditor.customs.field.description"
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
			customSections: [
				{
					id: "c1",
					title: "Skills",
					description: "<p>Rust</p>",
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
		createdAt: 1,
		updatedAt: 1,
	};
}

describe("CustomSectionForm", () => {
	it("debounces custom section persistence by 1s", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(
			<CustomSectionForm cv={cv} sectionId="c1" onPersisted={onPersisted} />,
		);

		fireEvent.change(screen.getByLabelText("cvEditor.customs.field.title"), {
			target: { value: "Technical skills" },
		});

		await vi.advanceTimersByTimeAsync(999);
		expect(saveCvMock).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.customSections[0].title).toBe(
			"Technical skills",
		);
	});

	it("flushes on title blur", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(
			<CustomSectionForm cv={cv} sectionId="c1" onPersisted={onPersisted} />,
		);

		const title = screen.getByLabelText("cvEditor.customs.field.title");
		fireEvent.change(title, { target: { value: "Awards" } });
		await act(async () => {
			fireEvent.blur(title);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.customSections[0].title).toBe(
			"Awards",
		);
	});

	it("deletes the section and its order slot after confirmation", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		render(
			<CustomSectionForm cv={cv} sectionId="c1" onPersisted={onPersisted} />,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "cvEditor.customs.delete" }),
		);
		fireEvent.click(
			screen.getByRole("button", {
				name: "cvEditor.customs.deleteConfirm",
			}),
		);

		await act(async () => {
			await Promise.resolve();
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		const saved = saveCvMock.mock.calls[0]?.[0] as Cv;
		expect(saved.content.customSections).toEqual([]);
		expect(saved.content.sectionOrder).toEqual([
			"identity",
			"experiences",
			"education",
			"languages",
		]);
		expect(onPersisted).toHaveBeenCalled();
	});

	it("persists TipTap description HTML", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<CustomSectionForm cv={cv} sectionId="c1" onPersisted={vi.fn()} />);

		fireEvent.change(
			screen.getByLabelText("cvEditor.customs.field.description"),
			{ target: { value: "<p>TypeScript</p>" } },
		);
		await vi.advanceTimersByTimeAsync(1000);

		expect(
			saveCvMock.mock.calls[0]?.[0].content.customSections[0].description,
		).toBe("<p>TypeScript</p>");
	});
});
