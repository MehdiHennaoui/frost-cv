/** @vitest-environment jsdom */

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	type CreateCvInput,
	type Cv,
	createEmptyCvContent,
} from "@/entities/cv";
import { CreateCvModal } from "./create-cv-modal";

afterEach(() => {
	cleanup();
});

function emptyCv(overrides: Partial<Cv> = {}): Cv {
	return {
		id: "cv-1",
		title: "My CV",
		locale: "en",
		content: createEmptyCvContent(),
		createdAt: 1,
		updatedAt: 1,
		...overrides,
	};
}

describe("CreateCvModal", () => {
	it("does not create when title is empty", async () => {
		const createCv = vi.fn();
		const onCreated = vi.fn();

		render(
			<CreateCvModal
				open
				onOpenChange={() => {}}
				createCv={createCv}
				onCreated={onCreated}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /^create cv$/i }));

		await waitFor(() => {
			expect(screen.getByRole("alert").textContent).toMatch(
				/title is required/i,
			);
			expect(createCv).not.toHaveBeenCalled();
			expect(onCreated).not.toHaveBeenCalled();
		});
	});

	it("creates a CV and reports the new id on submit", async () => {
		const createCv = vi.fn(async (_input: CreateCvInput) =>
			emptyCv({ id: "new-id", title: "Frontend", locale: "fr-CA" }),
		);
		const onCreated = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<CreateCvModal
				open
				onOpenChange={onOpenChange}
				createCv={createCv}
				onCreated={onCreated}
			/>,
		);

		fireEvent.change(screen.getByLabelText(/title/i), {
			target: { value: "Frontend" },
		});
		fireEvent.change(screen.getByLabelText(/cv locale/i), {
			target: { value: "fr-CA" },
		});
		fireEvent.click(screen.getByRole("button", { name: /^create cv$/i }));

		await waitFor(() => {
			expect(createCv).toHaveBeenCalledWith({
				title: "Frontend",
				locale: "fr-CA",
			});
			expect(onCreated).toHaveBeenCalledWith("new-id");
		});
	});

	it("does not create when dismissed", async () => {
		const createCv = vi.fn();
		const onCreated = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<CreateCvModal
				open
				onOpenChange={onOpenChange}
				createCv={createCv}
				onCreated={onCreated}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

		await waitFor(() => {
			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(createCv).not.toHaveBeenCalled();
			expect(onCreated).not.toHaveBeenCalled();
		});
	});
});
