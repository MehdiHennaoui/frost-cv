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

export type EducationEntry = {
	id: string;
	school: string;
	degree: string;
	/** City / country as a single free-text line. */
	location: string;
	/** `YYYY-MM` from `<input type="month">`, or empty. */
	startMonth: string;
	endMonth: string;
};

const EMPTY: EducationEntry = {
	id: "",
	school: "",
	degree: "",
	location: "",
	startMonth: "",
	endMonth: "",
};

const END_BEFORE_START = "cvEditor.education.errors.endBeforeStart" as const;

function readEducation(raw: unknown): EducationEntry {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return { ...EMPTY };
	}
	const entry = raw as Record<string, unknown>;
	return {
		id: readString(entry.id),
		school: readString(entry.school),
		degree: readString(entry.degree),
		location: readString(entry.location),
		startMonth: readString(entry.startMonth),
		endMonth: readString(entry.endMonth),
	};
}

export function createEmptyEducation(): EducationEntry {
	return {
		...EMPTY,
		id: crypto.randomUUID(),
	};
}

export function educationOf(content: CvContent): EducationEntry[] {
	return entriesOf(content, "education", readEducation);
}

export function withEducation(
	content: CvContent,
	education: EducationEntry[],
): CvContent {
	return withContentEntries(content, "education", education);
}

export const educationEqual = entriesEqual<EducationEntry>;

export function educationDateRangeError(entry: EducationEntry) {
	return monthRangeError(entry, END_BEFORE_START);
}

export function educationHaveValidDateRanges(
	entries: EducationEntry[],
): boolean {
	return entriesHaveValidMonthRanges(entries);
}

export function educationDateRangeLabel(
	entry: EducationEntry,
	locale: CvLocale,
): string {
	return monthDateRangeLabel(entry, { locale });
}
