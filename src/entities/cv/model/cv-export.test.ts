import { describe, expect, it } from "vitest";

import { type Cv, createEmptyCvContent } from "./cv";
import {
	cvDownloadStem,
	cvExportFile,
	cvExportFilename,
	libraryExportFile,
	parseCvExportDocument,
	parseLibraryExportDocument,
	toCvExportDocument,
	toLibraryExportDocument,
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

describe("cvDownloadStem", () => {
	it("joins slugified identity parts and locale in lowercase", () => {
		expect(cvDownloadStem(SAMPLE_CV)).toBe("ada-lovelace-analyst-en");
	});

	it("omits empty identity parts and slugifies job titles", () => {
		expect(
			cvDownloadStem({
				...SAMPLE_CV,
				locale: "fr",
				content: {
					...SAMPLE_CV.content,
					identity: {
						firstName: "José",
						lastName: "",
						jobTitle: "Staff Software Engineer",
						email: "",
						phone: "",
						postalCode: "",
						linkedin: "",
						github: "",
						website: "",
						description: "",
					},
				},
			}),
		).toBe("jose-staff-software-engineer-fr");
	});

	it("falls back to frost-cv when identity name fields are empty", () => {
		expect(
			cvDownloadStem({
				...SAMPLE_CV,
				locale: "en",
				content: createEmptyCvContent(),
			}),
		).toBe("frost-cv");
	});
});

describe("cvExportFile", () => {
	it("builds a downloadable filename and JSON text from identity", () => {
		expect(cvExportFilename(SAMPLE_CV)).toBe("ada-lovelace-analyst-en.json");

		const file = cvExportFile(SAMPLE_CV);
		expect(file.filename).toBe("ada-lovelace-analyst-en.json");
		expect(JSON.parse(file.text)).toEqual(toCvExportDocument(SAMPLE_CV));
	});
});

describe("libraryExportFile", () => {
	it("serializes CVs in call order into the library envelope", () => {
		const second: Cv = {
			...SAMPLE_CV,
			id: "cv-2",
			title: "Second",
			locale: "fr",
		};

		expect(toLibraryExportDocument([SAMPLE_CV, second])).toEqual({
			schemaVersion: 1,
			cvs: [toCvExportDocument(SAMPLE_CV), toCvExportDocument(second)],
		});

		const file = libraryExportFile([SAMPLE_CV, second]);
		expect(file.filename).toBe("frost-cv-library.json");
		expect(JSON.parse(file.text)).toEqual(
			toLibraryExportDocument([SAMPLE_CV, second]),
		);
	});

	it("round-trips a library document through parse", () => {
		const file = libraryExportFile([SAMPLE_CV]);
		const parsed = parseLibraryExportDocument(file.text);

		expect(parsed).toEqual({
			ok: true,
			value: [
				{
					title: "Software Engineer",
					locale: "en",
					content: SAMPLE_CV.content,
				},
			],
		});
	});

	it("rejects an empty cvs array and a single-CV document shape", () => {
		expect(
			parseLibraryExportDocument(JSON.stringify({ schemaVersion: 1, cvs: [] })),
		).toEqual({ ok: false, error: "libraryExport.empty" });

		expect(
			parseLibraryExportDocument(JSON.stringify(toCvExportDocument(SAMPLE_CV))),
		).toEqual({ ok: false, error: "libraryExport.unsupportedVersion" });
	});

	it("names the invalid CV by title, or CV #N when title is blank", () => {
		const valid = toCvExportDocument(SAMPLE_CV);
		const brokenWithTitle = {
			schemaVersion: 1,
			title: "Broken Resume",
			locale: "en",
			content: { ...valid.content, sectionOrder: [] },
		};
		const brokenBlankTitle = {
			schemaVersion: 1,
			title: "   ",
			locale: "en",
			content: { ...valid.content, sectionOrder: [] },
		};

		expect(
			parseLibraryExportDocument(
				JSON.stringify({ schemaVersion: 1, cvs: [valid, brokenWithTitle] }),
			),
		).toEqual({
			ok: false,
			error: "libraryExport.invalidSchema",
			cvLabel: "Broken Resume",
		});

		expect(
			parseLibraryExportDocument(
				JSON.stringify({
					schemaVersion: 1,
					cvs: [valid, brokenBlankTitle],
				}),
			),
		).toEqual({
			ok: false,
			error: "libraryExport.invalidSchema",
			cvLabel: "CV #2",
		});
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
