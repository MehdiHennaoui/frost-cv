import { z } from "zod";

import type { CvContent } from "@/entities/cv";

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

const monthYearSchema = z.union([
	z.literal(""),
	z.string().regex(/^\d{4}-\d{2}$/),
]);

/** Entry shape + start ≤ end when both months are set (skipped for current roles). */
export const experienceEntrySchema = z
	.object({
		id: z.string(),
		jobTitle: z.string(),
		company: z.string(),
		location: z.string(),
		startMonth: monthYearSchema,
		endMonth: monthYearSchema,
		isCurrent: z.boolean(),
		description: z.string(),
	})
	.superRefine((entry, ctx) => {
		if (entry.isCurrent) {
			return;
		}
		if (!entry.startMonth || !entry.endMonth) {
			return;
		}
		if (entry.startMonth > entry.endMonth) {
			ctx.addIssue({
				code: "custom",
				message: "cvEditor.experiences.errors.endBeforeStart",
				path: ["endMonth"],
			});
		}
	});

export type ExperienceDateErrorKey =
	"cvEditor.experiences.errors.endBeforeStart";

/** Returns an i18n key when start/end months are incoherent; otherwise null. */
export function experienceDateRangeError(
	entry: ExperienceEntry,
): ExperienceDateErrorKey | null {
	const result = experienceEntrySchema.safeParse(entry);
	if (result.success) {
		return null;
	}
	const issue = result.error.issues.find(
		(item) => item.message === "cvEditor.experiences.errors.endBeforeStart",
	);
	return issue ? (issue.message as ExperienceDateErrorKey) : null;
}

export function experiencesHaveValidDateRanges(
	entries: ExperienceEntry[],
): boolean {
	return entries.every(
		(entry) => experienceEntrySchema.safeParse(entry).success,
	);
}

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

function readString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

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

/** Reads persisted experience entries from CV content. */
export function experiencesOf(content: CvContent): ExperienceEntry[] {
	const raw = content.experiences;
	if (!Array.isArray(raw)) {
		return [];
	}
	return raw.map(readExperience);
}

/** Merges experiences into CV content without dropping other sections. */
export function withExperiences(
	content: CvContent,
	experiences: ExperienceEntry[],
): CvContent {
	return {
		...content,
		experiences: experiences.map((entry) => ({
			...entry,
			endMonth: entry.isCurrent ? "" : entry.endMonth,
		})),
	};
}

export function experiencesEqual(
	a: ExperienceEntry[],
	b: ExperienceEntry[],
): boolean {
	if (a.length !== b.length) {
		return false;
	}
	return a.every((entry, index) => {
		const other = b[index];
		return (
			entry.id === other.id &&
			entry.jobTitle === other.jobTitle &&
			entry.company === other.company &&
			entry.location === other.location &&
			entry.startMonth === other.startMonth &&
			entry.endMonth === other.endMonth &&
			entry.isCurrent === other.isCurrent &&
			entry.description === other.description
		);
	});
}

/** Moves an entry to `toIndex` (0-based). No-op if the id or index is invalid. */
export function moveExperienceTo(
	list: ExperienceEntry[],
	id: string,
	toIndex: number,
): ExperienceEntry[] {
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

export function removeExperience(
	list: ExperienceEntry[],
	id: string,
): ExperienceEntry[] {
	return list.filter((entry) => entry.id !== id);
}

function formatMonthYear(value: string): string {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	if (!match) {
		return value;
	}
	return `${match[2]}/${match[1]}`;
}

/** Preview date range; pass Present/Présent already resolved for the CV locale. */
export function experienceDateRangeLabel(
	entry: ExperienceEntry,
	presentLabel: string,
): string {
	const start = entry.startMonth ? formatMonthYear(entry.startMonth) : "";
	const end = entry.isCurrent
		? presentLabel
		: entry.endMonth
			? formatMonthYear(entry.endMonth)
			: "";
	if (start && end) {
		return `${start} – ${end}`;
	}
	return start || end;
}
