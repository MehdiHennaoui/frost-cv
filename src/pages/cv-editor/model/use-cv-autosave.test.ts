/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Cv, createEmptyCvContent } from "@/entities/cv";
import { flushOnFormLeave, useCvAutosave } from "./use-cv-autosave";

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
		title: "CV",
		locale: "en",
		content: createEmptyCvContent(),
		createdAt: 1,
		updatedAt: 1,
	};
}

describe("useCvAutosave", () => {
	it("debounces save through apply + saveCv", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		saveCvMock.mockImplementation(async (next: Cv) => ({
			...next,
			updatedAt: 2,
		}));
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		const { result } = renderHook(() =>
			useCvAutosave({
				cv,
				onPersisted,
				initialSaved: "a",
				apply: (content, value) => ({ ...content, note: value }),
			}),
		);

		act(() => {
			result.current.schedule("b");
		});
		await vi.advanceTimersByTimeAsync(999);
		expect(saveCvMock).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.note).toBe("b");
		await Promise.resolve();
		expect(onPersisted).toHaveBeenCalled();
	});

	it("skips schedule when canSave is false", async () => {
		const cv = sampleCv();
		saveCvMock.mockImplementation(async (next: Cv) => next);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		const { result } = renderHook(() =>
			useCvAutosave({
				cv,
				onPersisted: vi.fn(),
				initialSaved: "ok",
				apply: (content, value) => ({ ...content, note: value }),
				canSave: (value) => value !== "bad",
			}),
		);

		act(() => {
			result.current.schedule("bad");
		});
		await vi.advanceTimersByTimeAsync(1000);
		act(() => {
			result.current.flush();
		});
		expect(saveCvMock).not.toHaveBeenCalled();
	});
});

describe("flushOnFormLeave", () => {
	it("skips flush when focus stays inside the form", () => {
		const form = document.createElement("form");
		const from = document.createElement("input");
		const to = document.createElement("input");
		form.append(from, to);
		const flush = vi.fn();

		flushOnFormLeave({ currentTarget: from, relatedTarget: to }, flush);
		expect(flush).not.toHaveBeenCalled();

		flushOnFormLeave({ currentTarget: from, relatedTarget: null }, flush);
		expect(flush).toHaveBeenCalledOnce();
	});
});
