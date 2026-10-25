/** @vitest-environment jsdom */

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteCvConfirmModal } from "./delete-cv-confirm-modal";

afterEach(() => {
	cleanup();
});

describe("DeleteCvConfirmModal", () => {
	it("names the CV in the confirmation", () => {
		render(
			<DeleteCvConfirmModal
				open
				cvId="cv-1"
				cvTitle="Frontend CV"
				onOpenChange={() => {}}
				deleteCv={vi.fn()}
				onDeleted={() => {}}
			/>,
		);

		expect(screen.getByText("deleteCv.description")).toBeTruthy();
		expect(
			screen.getByRole("heading", { name: "deleteCv.title" }),
		).toBeTruthy();
	});

	it("deletes and reports success on confirm", async () => {
		const deleteCv = vi.fn(async () => undefined);
		const onDeleted = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<DeleteCvConfirmModal
				open
				cvId="cv-1"
				cvTitle="Frontend CV"
				onOpenChange={onOpenChange}
				deleteCv={deleteCv}
				onDeleted={onDeleted}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "deleteCv.confirm" }));

		await waitFor(() => {
			expect(deleteCv).toHaveBeenCalledWith("cv-1");
			expect(onDeleted).toHaveBeenCalled();
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it("does not delete when cancelled", async () => {
		const deleteCv = vi.fn();
		const onDeleted = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<DeleteCvConfirmModal
				open
				cvId="cv-1"
				cvTitle="Frontend CV"
				onOpenChange={onOpenChange}
				deleteCv={deleteCv}
				onDeleted={onDeleted}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "deleteCv.cancel" }));

		await waitFor(() => {
			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(deleteCv).not.toHaveBeenCalled();
			expect(onDeleted).not.toHaveBeenCalled();
		});
	});
});
