import type { CvContent } from "@/entities/cv";

export function readString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

/** Moves an entry to `toIndex` (0-based). No-op if the id or index is invalid. */
export function moveEntryTo<T extends { id: string }>(
	list: T[],
	id: string,
	toIndex: number,
): T[] {
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

export function removeEntry<T extends { id: string }>(
	list: T[],
	id: string,
): T[] {
	return list.filter((entry) => entry.id !== id);
}

export function entriesEqual<T extends object>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) {
		return false;
	}
	return a.every((entry, index) => {
		const other = b[index];
		const keys = Object.keys(entry) as Array<keyof T>;
		return keys.every((key) => entry[key] === other[key]);
	});
}

/** Reads a typed entry list from a CV content key. */
export function entriesOf<T>(
	content: CvContent,
	key: string,
	read: (raw: unknown) => T,
): T[] {
	const raw = content[key];
	if (!Array.isArray(raw)) {
		return [];
	}
	return raw.map(read);
}

/** Writes an entry list into a CV content key without dropping other sections. */
export function withContentEntries<T>(
	content: CvContent,
	key: string,
	entries: T[],
	mapEntry: (entry: T) => T = (entry) => ({ ...entry }),
): CvContent {
	return {
		...content,
		[key]: entries.map(mapEntry),
	};
}
