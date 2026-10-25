import { z } from "zod";

/** CV content payload; section shapes fill in on later tickets. */
export type CvContent = Record<string, unknown>;

export const cvLocaleSchema = z.enum(["en", "fr-CA"]);

export type CvLocale = z.infer<typeof cvLocaleSchema>;

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
	};
}
