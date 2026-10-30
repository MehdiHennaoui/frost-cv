/** @vitest-environment jsdom */

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CvImportPayload } from "@/entities/cv";
import { ReplaceCvImportDialog } from "./replace-cv-import-dialog";

afterEach(() => {
	cleanup();
});

function validExportText(title = "Replacement") {
	return JSON.stringify({
		schemaVersion: 1,
		title,
		locale: "fr",
		content: {
			identity: {
				firstName: "Grace",
				lastName: "Hopper",
				jobTitle: "",
				email: "",
				phone: "",
				postalCode: "",
				linkedin: "",
				github: "",
				website: "",
				description: "",
			},
			experiences: [],
			education: [],
			languages: [],
			customSections: [],
			sectionOrder: ["identity", "experiences", "education", "languages"],
		},
	});
}

describe("ReplaceCvImportDialog", () => {
	it("requires confirmation before replacing", async () => {
		const replaceCvFromImport = vi.fn(async (payload: CvImportPayload) => ({
			id: "cv-1",
			title: payload.title,
			locale: payload.locale,
			content: payload.content,
			createdAt: 1,
			updatedAt: 2,
		}));
		const onReplaced = vi.fn();

		render(
			<ReplaceCvImportDialog
				open
				cvTitle="Current"
				onOpenChange={vi.fn()}
				replaceCvFromImport={replaceCvFromImport}
				onReplaced={onReplaced}
			/>,
		);

		const confirm = screen.getByRole("button", {
			name: "cvExport.replaceConfirm",
		});
		expect(confirm.hasAttribute("disabled")).toBe(true);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: {
				files: [
					new File([validExportText()], "cv.json", {
						type: "application/json",
					}),
				],
			},
		});

		await waitFor(() => {
			expect(screen.getByText("cvExport.replaceReady")).toBeTruthy();
		});
		expect(replaceCvFromImport).not.toHaveBeenCalled();

		fireEvent.click(
			screen.getByRole("button", { name: "cvExport.replaceConfirm" }),
		);

		await waitFor(() => {
			expect(replaceCvFromImport).toHaveBeenCalledTimes(1);
		});
		expect(onReplaced).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Replacement", locale: "fr" }),
		);
	});
});
