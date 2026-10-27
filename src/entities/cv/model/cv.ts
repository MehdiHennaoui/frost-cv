import { z } from "zod";

/** CV content payload; section shapes fill in on later tickets. */
export type CvContent = Record<string, unknown>;

export const cvLocaleSchema = z.enum(["en", "fr-CA"]);

export type CvLocale = z.infer<typeof cvLocaleSchema>;

/** Identity is always first; other slots are reorderable later. */
export const DEFAULT_SECTION_ORDER = [
	"identity",
	"experiences",
	"education",
	"languages",
	"customs",
] as const;

export type SectionKey = (typeof DEFAULT_SECTION_ORDER)[number];

export type Cv = {
	id: string;
	title: string;
	locale: CvLocale;
	content: CvContent;
	createdAt: number;
	updatedAt: number;
};

export const createCvInputSchema = z.object({
	title: z.string().trim().min(1, "createCv.titleRequired"),
	locale: cvLocaleSchema,
});

export type CreateCvInput = z.infer<typeof createCvInputSchema>;

export function createEmptyCvContent(): CvContent {
	return {
		identity: {},
		experiences: [],
		education: [],
		languages: [],
		customSections: [],
		sectionOrder: [...DEFAULT_SECTION_ORDER],
	};
}

function isSectionKey(value: unknown): value is SectionKey {
	return (
		typeof value === "string" &&
		(DEFAULT_SECTION_ORDER as readonly string[]).includes(value)
	);
}

function isCompleteSectionOrder(value: unknown): value is SectionKey[] {
	if (!Array.isArray(value)) {
		return false;
	}
	if (value.length !== DEFAULT_SECTION_ORDER.length) {
		return false;
	}
	if (value[0] !== "identity") {
		return false;
	}
	if (!value.every(isSectionKey)) {
		return false;
	}
	return DEFAULT_SECTION_ORDER.every((key) => value.includes(key));
}

/** Reads persisted section order; Identity must stay first with all placeholder slots. */
export function sectionOrderOf(content: CvContent): SectionKey[] {
	if (isCompleteSectionOrder(content.sectionOrder)) {
		return content.sectionOrder;
	}
	return [...DEFAULT_SECTION_ORDER];
}
