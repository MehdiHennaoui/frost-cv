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

/** Reads persisted section order; Identity must stay first with all placeholder slots. */
export function sectionOrderOf(content: CvContent): SectionKey[] {
	const raw = content.sectionOrder;
	const allowed = DEFAULT_SECTION_ORDER as readonly string[];
	if (
		Array.isArray(raw) &&
		raw.length === DEFAULT_SECTION_ORDER.length &&
		raw[0] === "identity" &&
		raw.every(
			(key): key is SectionKey =>
				typeof key === "string" && allowed.includes(key),
		) &&
		DEFAULT_SECTION_ORDER.every((key) => raw.includes(key))
	) {
		return raw;
	}
	return [...DEFAULT_SECTION_ORDER];
}
