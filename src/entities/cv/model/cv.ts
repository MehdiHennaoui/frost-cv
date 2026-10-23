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
