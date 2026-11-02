/** @vitest-environment jsdom */

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CvImportPayload, LibraryImportMode } from "@/entities/cv";
import { toast } from "@/shared/ui/toast";
import { ImportLibraryModal } from "./import-library-modal";

vi.mock("@/shared/ui/toast", () => ({
	toast: {
		add: vi.fn(),
	},
}));

afterEach(() => {
	cleanup();
	vi.mocked(toast.add).mockClear();
});

function validLibraryText() {
	return JSON.stringify({
		schemaVersion: 1,
		cvs: [
			{
				schemaVersion: 1,
				title: "Imported Library CV",
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
			},
		],
	});
}

describe("ImportLibraryModal", () => {
	it("imports with add after choosing the mode and a valid library file", async () => {
		const importLibraryCvs = vi.fn(
			async (payloads: CvImportPayload[], _mode: LibraryImportMode) =>
				payloads.map((payload, index) => ({
					id: `new-${index}`,
					title: payload.title,
					locale: payload.locale,
					content: payload.content,
					createdAt: 1,
					updatedAt: 1,
				})),
		);
		const onImported = vi.fn();

		render(
			<ImportLibraryModal
				open
				onOpenChange={vi.fn()}
				importLibraryCvs={importLibraryCvs}
				onImported={onImported}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "libraryImport.add" }));

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const file = new File([validLibraryText()], "frost-cv-library.json", {
			type: "application/json",
		});
		fireEvent.change(input, { target: { files: [file] } });

		await waitFor(() => {
			expect(importLibraryCvs).toHaveBeenCalledTimes(1);
		});
		expect(importLibraryCvs.mock.calls[0]?.[1]).toBe("add");
		expect(importLibraryCvs.mock.calls[0]?.[0][0]?.title).toBe(
			"Imported Library CV",
		);
		expect(onImported).toHaveBeenCalledTimes(1);
		expect(toast.add).toHaveBeenCalledWith({
			type: "success",
			title: "libraryImport.importSuccess",
		});
	});

	it("requires replace confirmation before the file picker", async () => {
		const importLibraryCvs = vi.fn();

		render(
			<ImportLibraryModal
				open
				onOpenChange={vi.fn()}
				importLibraryCvs={importLibraryCvs}
				onImported={vi.fn()}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "libraryImport.replace" }),
		);

		expect(
			screen.getByRole("heading", {
				name: "libraryImport.confirmReplaceTitle",
			}),
		).toBeTruthy();
		expect(document.querySelector('input[type="file"]')).toBeNull();

		fireEvent.click(
			screen.getByRole("button", { name: "libraryImport.confirmReplace" }),
		);

		expect(document.querySelector('input[type="file"]')).toBeTruthy();
		expect(importLibraryCvs).not.toHaveBeenCalled();
	});

	it("toasts the failing CV label when a library entry is invalid", async () => {
		const importLibraryCvs = vi.fn();

		render(
			<ImportLibraryModal
				open
				onOpenChange={vi.fn()}
				importLibraryCvs={importLibraryCvs}
				onImported={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "libraryImport.add" }));

		const broken = JSON.stringify({
			schemaVersion: 1,
			cvs: [
				{
					schemaVersion: 1,
					title: "Broken Resume",
					locale: "en",
					content: { sectionOrder: [] },
				},
			],
		});
		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: {
				files: [new File([broken], "bad.json", { type: "application/json" })],
			},
		});

		await waitFor(() => {
			expect(toast.add).toHaveBeenCalledWith({
				type: "error",
				title: "libraryExport.invalidSchema",
			});
		});
		expect(importLibraryCvs).not.toHaveBeenCalled();
	});

	it("imports with replace after confirmation and shows a success toast", async () => {
		const importLibraryCvs = vi.fn(
			async (payloads: CvImportPayload[], _mode: LibraryImportMode) =>
				payloads.map((payload, index) => ({
					id: `new-${index}`,
					title: payload.title,
					locale: payload.locale,
					content: payload.content,
					createdAt: 1,
					updatedAt: 1,
				})),
		);
		const onImported = vi.fn();

		render(
			<ImportLibraryModal
				open
				onOpenChange={vi.fn()}
				importLibraryCvs={importLibraryCvs}
				onImported={onImported}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "libraryImport.replace" }),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "libraryImport.confirmReplace" }),
		);

		const input = document.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: {
				files: [
					new File([validLibraryText()], "frost-cv-library.json", {
						type: "application/json",
					}),
				],
			},
		});

		await waitFor(() => {
			expect(importLibraryCvs).toHaveBeenCalledTimes(1);
		});
		expect(importLibraryCvs.mock.calls[0]?.[1]).toBe("replace");
		expect(onImported).toHaveBeenCalledTimes(1);
		expect(toast.add).toHaveBeenCalledWith({
			type: "success",
			title: "libraryImport.importSuccess",
		});
	});
});
