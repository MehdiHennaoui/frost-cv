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
import { toast } from "@/shared/ui/toast";
import { ReplaceCvImportDialog } from "./replace-cv-import-dialog";

vi.mock("@/shared/ui/toast", () => ({
	toast: {
		add: vi.fn(),
	},
}));

afterEach(() => {
	cleanup();
	vi.mocked(toast.add).mockClear();
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
	it("requires confirmation before replacing and shows a success toast", async () => {
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
		expect(toast.add).toHaveBeenCalledWith({
			type: "success",
			title: "cvExport.replaceSuccess",
		});
		expect(screen.queryByRole("alert")).toBeNull();
	});

	it("shows an error toast for invalid JSON without an inline alert", async () => {
		const replaceCvFromImport = vi.fn();

		render(
			<ReplaceCvImportDialog
				open
				cvTitle="Current"
				onOpenChange={vi.fn()}
				replaceCvFromImport={replaceCvFromImport}
				onReplaced={vi.fn()}
			/>,
		);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: {
				files: [
					new File(["{nope"], "bad.json", {
						type: "application/json",
					}),
				],
			},
		});

		await waitFor(() => {
			expect(toast.add).toHaveBeenCalledWith({
				type: "error",
				title: "cvExport.invalidJson",
			});
		});
		expect(replaceCvFromImport).not.toHaveBeenCalled();
		expect(screen.queryByRole("alert")).toBeNull();
	});
});
