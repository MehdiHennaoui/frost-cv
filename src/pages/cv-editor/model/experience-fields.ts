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

export function moveExperience(
	list: ExperienceEntry[],
	id: string,
	direction: "up" | "down",
): ExperienceEntry[] {
	const index = list.findIndex((entry) => entry.id === id);
	if (index < 0) {
		return list;
	}
	const target = direction === "up" ? index - 1 : index + 1;
	if (target < 0 || target >= list.length) {
		return list;
	}
	const next = [...list];
	const [item] = next.splice(index, 1);
	next.splice(target, 0, item);
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
