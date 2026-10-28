import type { CvContent, CvLocale } from "@/entities/cv";
import {
	entriesEqual,
	entriesOf,
	readString,
	withContentEntries,
} from "./entry-list";
import {
	entriesHaveValidMonthRanges,
	monthDateRangeLabel,
	monthRangeError,
} from "./month-year";

export type ExperienceEntry = {
	id: string;
	jobTitle: string;
	company: string;
	location: string;
	/** `YYYY-MM` from `<input type="month">`, or empty. */
	startMonth: string;
	endMonth: string;
	isCurrent: boolean;
	description: string;
};

const EMPTY: ExperienceEntry = {
	id: "",
	jobTitle: "",
	company: "",
	location: "",
	startMonth: "",
	endMonth: "",
	isCurrent: false,
	description: "",
};

const END_BEFORE_START = "cvEditor.experiences.errors.endBeforeStart" as const;

function readExperience(raw: unknown): ExperienceEntry {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return { ...EMPTY };
	}
	const entry = raw as Record<string, unknown>;
	return {
		id: readString(entry.id),
		jobTitle: readString(entry.jobTitle),
		company: readString(entry.company),
		location: readString(entry.location),
		startMonth: readString(entry.startMonth),
		endMonth: readString(entry.endMonth),
		isCurrent: entry.isCurrent === true,
		description: readString(entry.description),
	};
}

export function createEmptyExperience(): ExperienceEntry {
	return {
		...EMPTY,
		id: crypto.randomUUID(),
	};
}

export function experiencesOf(content: CvContent): ExperienceEntry[] {
	return entriesOf(content, "experiences", readExperience);
}

export function withExperiences(
	content: CvContent,
	experiences: ExperienceEntry[],
): CvContent {
	return withContentEntries(content, "experiences", experiences, (entry) => ({
		...entry,
		endMonth: entry.isCurrent ? "" : entry.endMonth,
	}));
}

export const experiencesEqual = entriesEqual<ExperienceEntry>;

export function experienceDateRangeError(entry: ExperienceEntry) {
	return monthRangeError(entry, END_BEFORE_START);
}

export function experiencesHaveValidDateRanges(
	entries: ExperienceEntry[],
): boolean {
	return entriesHaveValidMonthRanges(entries);
}

export function experienceDateRangeLabel(
	entry: ExperienceEntry,
	locale: CvLocale,
	presentLabel: string,
): string {
	return monthDateRangeLabel(entry, { locale, presentLabel });
}
