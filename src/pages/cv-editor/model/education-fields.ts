import { z } from "zod";

import type { CvContent } from "@/entities/cv";

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

const monthYearSchema = z.union([
	z.literal(""),
	z.string().regex(/^\d{4}-\d{2}$/),
]);

/** Entry shape + start ≤ end when both months are set. */
export const educationEntrySchema = z
	.object({
		id: z.string(),
		school: z.string(),
		degree: z.string(),
		location: z.string(),
		startMonth: monthYearSchema,
		endMonth: monthYearSchema,
	})
	.superRefine((entry, ctx) => {
		if (!entry.startMonth || !entry.endMonth) {
			return;
		}
		if (entry.startMonth > entry.endMonth) {
			ctx.addIssue({
				code: "custom",
				message: "cvEditor.education.errors.endBeforeStart",
				path: ["endMonth"],
			});
		}
	});

export type EducationDateErrorKey = "cvEditor.education.errors.endBeforeStart";

/** Returns an i18n key when start/end months are incoherent; otherwise null. */
export function educationDateRangeError(
	entry: EducationEntry,
): EducationDateErrorKey | null {
	const result = educationEntrySchema.safeParse(entry);
	if (result.success) {
		return null;
	}
	const issue = result.error.issues.find(
		(item) => item.message === "cvEditor.education.errors.endBeforeStart",
	);
	return issue ? (issue.message as EducationDateErrorKey) : null;
}

export function educationHaveValidDateRanges(
	entries: EducationEntry[],
): boolean {
	return entries.every(
		(entry) => educationEntrySchema.safeParse(entry).success,
	);
}

const EMPTY: EducationEntry = {
	id: "",
	school: "",
	degree: "",
	location: "",
	startMonth: "",
	endMonth: "",
};

function readString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

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

/** Reads persisted education entries from CV content. */
export function educationOf(content: CvContent): EducationEntry[] {
	const raw = content.education;
	if (!Array.isArray(raw)) {
		return [];
	}
	return raw.map(readEducation);
}

/** Merges education into CV content without dropping other sections. */
export function withEducation(
	content: CvContent,
	education: EducationEntry[],
): CvContent {
	return {
		...content,
		education: education.map((entry) => ({ ...entry })),
	};
}

export function educationEqual(
	a: EducationEntry[],
	b: EducationEntry[],
): boolean {
	if (a.length !== b.length) {
		return false;
	}
	return a.every((entry, index) => {
		const other = b[index];
		return (
			entry.id === other.id &&
			entry.school === other.school &&
			entry.degree === other.degree &&
			entry.location === other.location &&
			entry.startMonth === other.startMonth &&
			entry.endMonth === other.endMonth
		);
	});
}

/** Moves an entry to `toIndex` (0-based). No-op if the id or index is invalid. */
export function moveEducationTo(
	list: EducationEntry[],
	id: string,
	toIndex: number,
): EducationEntry[] {
	const fromIndex = list.findIndex((entry) => entry.id === id);
	if (
		fromIndex < 0 ||
		toIndex < 0 ||
		toIndex >= list.length ||
		fromIndex === toIndex
	) {
		return list;
	}
	const next = [...list];
	const [item] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, item);
	return next;
}

export function removeEducation(
	list: EducationEntry[],
	id: string,
): EducationEntry[] {
	return list.filter((entry) => entry.id !== id);
}

function formatMonthYear(value: string): string {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	if (!match) {
		return value;
	}
	return `${match[2]}/${match[1]}`;
}

/** Preview date range for education (no Present flag). */
export function educationDateRangeLabel(entry: EducationEntry): string {
	const start = entry.startMonth ? formatMonthYear(entry.startMonth) : "";
	const end = entry.endMonth ? formatMonthYear(entry.endMonth) : "";
	if (start && end) {
		return `${start} – ${end}`;
	}
	return start || end;
}
