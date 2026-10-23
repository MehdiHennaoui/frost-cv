/** CV content payload; section shapes fill in on later tickets. */
export type CvContent = Record<string, unknown>;

export type CvLocale = "en" | "fr-CA";

export type Cv = {
	id: string;
	title: string;
	locale: CvLocale;
	content: CvContent;
	createdAt: number;
	updatedAt: number;
};

export type CreateCvInput = {
	title: string;
	locale: CvLocale;
};

export function createEmptyCvContent(): CvContent {
	return {
		identity: {},
		experiences: [],
		education: [],
		languages: [],
		customSections: [],
	};
}
