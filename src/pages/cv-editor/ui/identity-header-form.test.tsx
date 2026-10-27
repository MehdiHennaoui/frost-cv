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
import { IdentityHeaderForm } from "./identity-header-form";

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
			aria-label="cvEditor.identity.field.description"
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
		content: createEmptyCvContent(),
		createdAt: 1,
		updatedAt: 1,
	};
}

describe("IdentityHeaderForm", () => {
	it("debounces identity persistence by 1s", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		const saved = {
			...cv,
			content: {
				...cv.content,
				identity: { firstName: "Ada" },
			},
			updatedAt: 2,
		};
		saveCvMock.mockResolvedValue(saved);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<IdentityHeaderForm cv={cv} onPersisted={onPersisted} />);

		fireEvent.change(
			screen.getByLabelText("cvEditor.identity.field.firstName"),
			{ target: { value: "Ada" } },
		);

		await vi.advanceTimersByTimeAsync(999);
		expect(saveCvMock).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(saveCvMock.mock.calls[0]?.[0].content.identity.firstName).toBe(
			"Ada",
		);
		await Promise.resolve();
		expect(onPersisted).toHaveBeenCalledWith(saved);
	});

	it("flushes pending identity on field blur", async () => {
		const cv = sampleCv();
		const onPersisted = vi.fn();
		const saved = {
			...cv,
			updatedAt: 2,
			content: {
				...cv.content,
				identity: { firstName: "Grace" },
			},
		};
		saveCvMock.mockResolvedValue(saved);
		vi.useFakeTimers({
			toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
		});

		render(<IdentityHeaderForm cv={cv} onPersisted={onPersisted} />);

		const firstName = screen.getByLabelText(
			"cvEditor.identity.field.firstName",
		);
		fireEvent.change(firstName, { target: { value: "Grace" } });
		await act(async () => {
			fireEvent.blur(firstName);
		});

		expect(saveCvMock).toHaveBeenCalledTimes(1);
		expect(onPersisted).toHaveBeenCalledWith(saved);
	});
});
