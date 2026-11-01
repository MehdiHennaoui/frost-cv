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
import { ImportCvModal } from "./import-cv-modal";

vi.mock("@/shared/ui/toast", () => ({
	toast: {
		add: vi.fn(),
	},
}));

afterEach(() => {
	cleanup();
	vi.mocked(toast.add).mockClear();
});

function validExportText() {
	return JSON.stringify({
		schemaVersion: 1,
		title: "Imported CV",
		locale: "en",
		content: {
			identity: {
				firstName: "Ada",
				lastName: "Lovelace",
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

describe("ImportCvModal", () => {
	it("creates a CV from a valid JSON file and shows a success toast", async () => {
		const createCvFromImport = vi.fn(async (payload: CvImportPayload) => ({
			id: "new-id",
			title: payload.title,
			locale: payload.locale,
			content: payload.content,
			createdAt: 1,
			updatedAt: 1,
		}));
		const onCreated = vi.fn();

		render(
			<ImportCvModal
				open
				onOpenChange={vi.fn()}
				createCvFromImport={createCvFromImport}
				onCreated={onCreated}
			/>,
		);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File([validExportText()], "cv.json", {
			type: "application/json",
		});
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(createCvFromImport).toHaveBeenCalledTimes(1);
		});
		expect(createCvFromImport.mock.calls[0]?.[0].title).toBe("Imported CV");
		expect(onCreated).toHaveBeenCalledWith("new-id");
		expect(toast.add).toHaveBeenCalledWith({
			type: "success",
			title: "cvExport.importSuccess",
		});
		expect(screen.queryByRole("alert")).toBeNull();
	});

	it("shows an error toast for invalid JSON without an inline alert", async () => {
		const createCvFromImport = vi.fn();

		render(
			<ImportCvModal
				open
				onOpenChange={vi.fn()}
				createCvFromImport={createCvFromImport}
				onCreated={vi.fn()}
			/>,
		);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File(["{nope"], "bad.json", {
			type: "application/json",
		});
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(toast.add).toHaveBeenCalledWith({
				type: "error",
				title: "cvExport.invalidJson",
			});
		});
		expect(createCvFromImport).not.toHaveBeenCalled();
		expect(screen.queryByRole("alert")).toBeNull();
	});
});
