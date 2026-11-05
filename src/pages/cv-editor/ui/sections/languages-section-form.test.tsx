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
import {
	EditorForm,
	EditorFormProvider,
} from "../../model/form/editor-form-context";
import { EntryDeleteConfirmProvider } from "../entries/entry-delete-confirm-context";
import { LanguagesSectionForm } from "./languages-section-form";

function renderLanguages(cv: Cv, onPersisted = vi.fn()) {
	return render(
		<EditorFormProvider cv={cv} onPersisted={onPersisted}>
			<EntryDeleteConfirmProvider>
				<EditorForm>
					<LanguagesSectionForm />
				</EditorForm>
			</EntryDeleteConfirmProvider>
		</EditorFormProvider>,
	);
}

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
			languages: [
				{
					id: "lang-1",
					language: "French",
					level: "Fluent",
				},
			],
		},
		createdAt: 1,
		updatedAt: 1,
	};
}

function expandFirstEntry() {
	fireEvent.click(
		screen.getByRole("button", { name: /^cvEditor\.entry\.expand$/ }),
	);
}

describe("LanguagesSectionForm", () => {
	it("debounces language persistence by 1s", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		renderLanguages(cv, onPersisted);
		expandFirstEntry();

		fireEvent.change(
			screen.getByLabelText("cvEditor.languages.field.language"),
			{
				target: { value: "English" },
			},
		);

		await vi.advanceTimersByTimeAsync(999);
		expect(saveCvMock).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.languages[0].language).toBe(
			"English",
		);
		await Promise.resolve();
		expect(onPersisted).toHaveBeenCalled();
	});

	it("flushes pending language on field blur", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		renderLanguages(cv, onPersisted);
		expandFirstEntry();

		const language = screen.getByLabelText("cvEditor.languages.field.language");
		fireEvent.change(language, { target: { value: "Spanish" } });
		await act(async () => {
			fireEvent.blur(language);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(onPersisted).toHaveBeenCalled();
	});

	it("adds a language entry and persists after the debounce", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		renderLanguages(cv);

		await act(async () => {
			fireEvent.click(
				screen.getByRole("button", { name: "cvEditor.languages.add" }),
			);
		});
		expect(saveCvMock).not.toHaveBeenCalled();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.languages).toHaveLength(2);
	});

	it("deletes a language entry after confirmation", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		renderLanguages(cv);

		fireEvent.click(
			screen.getByRole("button", { name: "cvEditor.languages.delete" }),
		);
		const dialog = screen.getByRole("dialog");
		await act(async () => {
			fireEvent.click(
				within(dialog).getByRole("button", {
					name: "cvEditor.languages.deleteConfirm",
				}),
			);
		});
		expect(saveCvMock).not.toHaveBeenCalled();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.languages).toEqual([]);
	});

	it("moves a language entry via the position select", async () => {
		const cv = sampleCv();
		cv.content.languages = [
			...(cv.content.languages as object[]),
			{
				id: "lang-2",
				language: "English",
				level: "Native",
			},
		];
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));

		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});
		renderLanguages(cv);

		fireEvent.click(
			screen.getAllByRole("button", { name: "cvEditor.languages.position" })[0],
		);
		await act(async () => {
			fireEvent.click(screen.getAllByRole("menuitem")[1]);
		});
		expect(saveCvMock).not.toHaveBeenCalled();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(
			saveCvMock.mock.calls[0]?.[0].content.languages.map(
				(e: { id: string }) => e.id,
			),
		).toEqual(["lang-2", "lang-1"]);
	});
});
