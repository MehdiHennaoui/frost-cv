import { z } from "zod";

import {
	type Cv,
	type CvContent,
	type CvLocale,
	customSectionIdFromKey,
	cvLocaleSchema,
	DEFAULT_SECTION_ORDER,
	isCustomSectionKey,
} from "./cv";

export const CV_EXPORT_SCHEMA_VERSION = 1 as const;

const identitySchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	jobTitle: z.string(),
	email: z.string(),
	phone: z.string(),
	postalCode: z.string(),
	linkedin: z.string(),
	github: z.string(),
	website: z.string(),
	description: z.string(),
});

const experienceSchema = z.object({
	id: z.string().min(1),
	jobTitle: z.string(),
	company: z.string(),
	location: z.string(),
	startMonth: z.string(),
	endMonth: z.string(),
	isCurrent: z.boolean(),
	description: z.string(),
});

const educationSchema = z.object({
	id: z.string().min(1),
	school: z.string(),
	degree: z.string(),
	location: z.string(),
	startMonth: z.string(),
	endMonth: z.string(),
});

const languageSchema = z.object({
	id: z.string().min(1),
	language: z.string(),
	level: z.string(),
});

const customSectionSchema = z.object({
	id: z.string().min(1),
	title: z.string(),
	description: z.string(),
});

const builtinSectionKeySchema = z.enum(DEFAULT_SECTION_ORDER);

const sectionKeySchema = z
	.string()
	.refine(
		(
			value,
		): value is z.infer<typeof builtinSectionKeySchema> | `custom:${string}` =>
			builtinSectionKeySchema.safeParse(value).success ||
			isCustomSectionKey(value),
	);

const cvContentSchema = z
	.object({
		identity: identitySchema,
		experiences: z.array(experienceSchema),
		education: z.array(educationSchema),
		languages: z.array(languageSchema),
		customSections: z.array(customSectionSchema),
		sectionOrder: z.array(sectionKeySchema).min(1),
	})
	.superRefine((content, ctx) => {
		const { sectionOrder, customSections } = content;
		if (sectionOrder[0] !== "identity") {
			ctx.addIssue({
				code: "custom",
				message: "sectionOrder must start with identity",
				path: ["sectionOrder"],
			});
		}
		for (const key of DEFAULT_SECTION_ORDER) {
			if (!sectionOrder.includes(key)) {
				ctx.addIssue({
					code: "custom",
					message: `sectionOrder missing ${key}`,
					path: ["sectionOrder"],
				});
			}
		}
		const customIds = new Set(customSections.map((section) => section.id));
		for (const key of sectionOrder) {
			if (!isCustomSectionKey(key)) {
				continue;
			}
			if (!customIds.has(customSectionIdFromKey(key))) {
				ctx.addIssue({
					code: "custom",
					message: `sectionOrder references missing custom section ${key}`,
					path: ["sectionOrder"],
				});
			}
		}
	});

const cvExportDocumentSchema = z.object({
	schemaVersion: z.literal(CV_EXPORT_SCHEMA_VERSION),
	title: z.string().trim().min(1),
	locale: cvLocaleSchema,
	content: cvContentSchema,
});

export type CvExportDocument = z.infer<typeof cvExportDocumentSchema>;

export type CvImportPayload = {
	title: string;
	locale: CvLocale;
	content: CvContent;
};

export type ParseCvExportResult =
	| { ok: true; value: CvImportPayload }
	| {
			ok: false;
			error:
				| "cvExport.invalidJson"
				| "cvExport.unsupportedVersion"
				| "cvExport.invalidSchema";
	  };

export function toCvExportDocument(cv: Cv): CvExportDocument {
	return {
		schemaVersion: CV_EXPORT_SCHEMA_VERSION,
		title: cv.title,
		locale: cv.locale,
		content: cv.content as CvExportDocument["content"],
	};
}

export function cvExportFilename(title: string): string {
	const slug =
		title
			.trim()
			.replace(/[^\w.-]+/g, "-")
			.replace(/^-+|-+$/g, "") || "cv";
	return `${slug}.json`;
}

export function cvExportFile(cv: Cv): { filename: string; text: string } {
	return {
		filename: cvExportFilename(cv.title),
		text: `${JSON.stringify(toCvExportDocument(cv), null, 2)}\n`,
	};
}

export function parseCvExportDocument(text: string): ParseCvExportResult {
	let raw: unknown;
	try {
		raw = JSON.parse(text);
	} catch {
		return { ok: false, error: "cvExport.invalidJson" };
	}

	if (
		!raw ||
		typeof raw !== "object" ||
		Array.isArray(raw) ||
		!("schemaVersion" in raw) ||
		(raw as { schemaVersion?: unknown }).schemaVersion !==
			CV_EXPORT_SCHEMA_VERSION
	) {
		return { ok: false, error: "cvExport.unsupportedVersion" };
	}

	const parsed = cvExportDocumentSchema.safeParse(raw);
	if (!parsed.success) {
		return { ok: false, error: "cvExport.invalidSchema" };
	}

	return {
		ok: true,
		value: {
			title: parsed.data.title,
			locale: parsed.data.locale,
			content: parsed.data.content,
		},
	};
}
