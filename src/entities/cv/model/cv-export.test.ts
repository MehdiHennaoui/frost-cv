import { describe, expect, it } from "vitest";

import { type Cv, createEmptyCvContent } from "./cv";
import {
	cvExportFile,
	cvExportFilename,
	parseCvExportDocument,
	toCvExportDocument,
} from "./cv-export";

const SAMPLE_CV: Cv = {
	id: "cv-1",
	title: "Software Engineer",
	locale: "en",
	content: {
		identity: {
			firstName: "Ada",
			lastName: "Lovelace",
			jobTitle: "Analyst",
			email: "ada@example.com",
			phone: "",
			postalCode: "H2X 1Y4",
			linkedin: "",
			github: "",
			website: "",
			description: "<p>Hello</p>",
		},
		experiences: [
			{
				id: "exp-1",
				jobTitle: "Engineer",
				company: "Analytical",
				location: "London",
				startMonth: "1842-01",
				endMonth: "",
				isCurrent: true,
				description: "",
			},
		],
		education: [
			{
				id: "edu-1",
				school: "Home",
				degree: "Mathematics",
				location: "London",
				startMonth: "1830-01",
				endMonth: "1835-06",
			},
		],
		languages: [{ id: "lang-1", language: "English", level: "Native" }],
		customSections: [
			{
				id: "c1",
				title: "Publications",
				description: "<p>Notes</p>",
			},
		],
		sectionOrder: [
			"identity",
			"experiences",
			"custom:c1",
			"education",
			"languages",
		],
	},
	createdAt: 1_000,
	updatedAt: 2_000,
};

describe("toCvExportDocument", () => {
	it("serializes title, locale, content, and schema version without ids or timestamps", () => {
		expect(toCvExportDocument(SAMPLE_CV)).toEqual({
			schemaVersion: 1,
			title: "Software Engineer",
			locale: "en",
			content: SAMPLE_CV.content,
		});
	});

	it("round-trips empty CV content from createEmptyCvContent", () => {
		const emptyCv: Cv = {
			...SAMPLE_CV,
			title: "Blank",
			content: createEmptyCvContent(),
		};
		const parsed = parseCvExportDocument(
			JSON.stringify(toCvExportDocument(emptyCv)),
		);

		expect(parsed).toEqual({
			ok: true,
			value: {
				title: "Blank",
				locale: "en",
				content: createEmptyCvContent(),
			},
		});
	});
});

describe("cvExportFile", () => {
	it("builds a downloadable filename and JSON text", () => {
		expect(cvExportFilename("  My CV / v1  ")).toBe("My-CV-v1.json");
		expect(cvExportFilename("   ")).toBe("cv.json");

		const file = cvExportFile(SAMPLE_CV);
		expect(file.filename).toBe("Software-Engineer.json");
		expect(JSON.parse(file.text)).toEqual(toCvExportDocument(SAMPLE_CV));
	});
});

describe("parseCvExportDocument", () => {
	it("round-trips a v1 export and preserves section order", () => {
		const document = toCvExportDocument(SAMPLE_CV);
		const parsed = parseCvExportDocument(JSON.stringify(document));

		expect(parsed).toEqual({
			ok: true,
			value: {
				title: "Software Engineer",
				locale: "en",
				content: SAMPLE_CV.content,
			},
		});
	});

	it("fails gracefully on invalid JSON text", () => {
		expect(parseCvExportDocument("{not-json")).toEqual({
			ok: false,
			error: "cvExport.invalidJson",
		});
	});

	it("fails when schemaVersion is missing or unsupported", () => {
		expect(
			parseCvExportDocument(
				JSON.stringify({
					title: "X",
					locale: "en",
					content: SAMPLE_CV.content,
				}),
			),
		).toEqual({
			ok: false,
			error: "cvExport.unsupportedVersion",
		});

		expect(
			parseCvExportDocument(
				JSON.stringify({
					schemaVersion: 99,
					title: "X",
					locale: "en",
					content: SAMPLE_CV.content,
				}),
			),
		).toEqual({
			ok: false,
			error: "cvExport.unsupportedVersion",
		});
	});

	it("fails when required fields are invalid", () => {
		expect(
			parseCvExportDocument(
				JSON.stringify({
					schemaVersion: 1,
					title: "   ",
					locale: "en",
					content: SAMPLE_CV.content,
				}),
			),
		).toEqual({
			ok: false,
			error: "cvExport.invalidSchema",
		});

		expect(
			parseCvExportDocument(
				JSON.stringify({
					schemaVersion: 1,
					title: "X",
					locale: "de",
					content: SAMPLE_CV.content,
				}),
			),
		).toEqual({
			ok: false,
			error: "cvExport.invalidSchema",
		});
	});

	it("fails when sectionOrder omits a builtin or references a missing custom", () => {
		expect(
			parseCvExportDocument(
				JSON.stringify({
					schemaVersion: 1,
					title: "X",
					locale: "en",
					content: {
						...SAMPLE_CV.content,
						sectionOrder: ["identity", "experiences", "education"],
					},
				}),
			),
		).toEqual({
			ok: false,
			error: "cvExport.invalidSchema",
		});

		expect(
			parseCvExportDocument(
				JSON.stringify({
					schemaVersion: 1,
					title: "X",
					locale: "en",
					content: {
						...SAMPLE_CV.content,
						customSections: [],
						sectionOrder: [
							"identity",
							"experiences",
							"education",
							"languages",
							"custom:missing",
						],
					},
				}),
			),
		).toEqual({
			ok: false,
			error: "cvExport.invalidSchema",
		});
	});
});
