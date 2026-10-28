import {
	type CvContent,
	customSectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import {
	entriesOf,
	readString,
	removeEntry,
	withContentEntries,
} from "./entry-list";

export type CustomSection = {
	id: string;
	title: string;
	description: string;
};

const EMPTY: CustomSection = {
	id: "",
	title: "",
	description: "",
};

function readCustomSection(raw: unknown): CustomSection {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return { ...EMPTY };
	}
	const entry = raw as Record<string, unknown>;
	return {
		id: readString(entry.id),
		title: readString(entry.title),
		description: readString(entry.description),
	};
}

export function createEmptyCustomSection(): CustomSection {
	return {
		...EMPTY,
		id: crypto.randomUUID(),
	};
}

export function customSectionsOf(content: CvContent): CustomSection[] {
	return entriesOf(content, "customSections", readCustomSection);
}

export function withCustomSections(
	content: CvContent,
	customSections: CustomSection[],
): CvContent {
	return withContentEntries(content, "customSections", customSections);
}

export function customSectionOf(
	content: CvContent,
	id: string,
): CustomSection | undefined {
	return customSectionsOf(content).find((section) => section.id === id);
}

export function withCustomSection(
	content: CvContent,
	section: CustomSection,
): CvContent {
	const sections = customSectionsOf(content);
	const index = sections.findIndex((entry) => entry.id === section.id);
	if (index < 0) {
		return content;
	}
	const next = [...sections];
	next[index] = section;
	return withCustomSections(content, next);
}

/** Appends a custom section and its top-level `custom:<id>` order slot. */
export function addCustomSection(content: CvContent): {
	content: CvContent;
	section: CustomSection;
} {
	const section = createEmptyCustomSection();
	const customSections = [...customSectionsOf(content), section];
	const sectionOrder = [
		...sectionOrderOf(content),
		customSectionKey(section.id),
	];
	return {
		content: {
			...withCustomSections(content, customSections),
			sectionOrder,
		},
		section,
	};
}

/** Removes a custom section and its order slot. */
export function removeCustomSection(content: CvContent, id: string): CvContent {
	const customSections = removeEntry(customSectionsOf(content), id);
	const sectionOrder = sectionOrderOf(content).filter(
		(key) => key !== customSectionKey(id),
	);
	return {
		...withCustomSections(content, customSections),
		sectionOrder,
	};
}

export function customSectionEqual(
	a: CustomSection,
	b: CustomSection,
): boolean {
	return (
		a.id === b.id && a.title === b.title && a.description === b.description
	);
}
