import type { CvContent } from "@/entities/cv";
import {
	entriesEqual,
	entriesOf,
	readString,
	withContentEntries,
} from "./entry-list";

export type LanguageEntry = {
	id: string;
	language: string;
	/** Free-text proficiency; not a fixed enum. */
	level: string;
};

const EMPTY: LanguageEntry = {
	id: "",
	language: "",
	level: "",
};

function readLanguage(raw: unknown): LanguageEntry {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return { ...EMPTY };
	}
	const entry = raw as Record<string, unknown>;
	return {
		id: readString(entry.id),
		language: readString(entry.language),
		level: readString(entry.level),
	};
}

export function createEmptyLanguage(): LanguageEntry {
	return {
		...EMPTY,
		id: crypto.randomUUID(),
	};
}

export function languagesOf(content: CvContent): LanguageEntry[] {
	return entriesOf(content, "languages", readLanguage);
}

export function withLanguages(
	content: CvContent,
	languages: LanguageEntry[],
): CvContent {
	return withContentEntries(content, "languages", languages);
}

export const languageEqual = entriesEqual<LanguageEntry>;
