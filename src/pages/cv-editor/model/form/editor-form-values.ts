import {
	type CvContent,
	customSectionIdFromKey,
	customSectionKey,
	DEFAULT_SECTION_ORDER,
	isCustomSectionKey,
	type SectionKey,
	sectionOrderOf,
} from "@/entities/cv";
import type { CustomSection } from "../sections/custom-section-fields";
import { customSectionsOf } from "../sections/custom-section-fields";
import type { EducationEntry } from "../sections/education-fields";
import { educationOf } from "../sections/education-fields";
import type { ExperienceEntry } from "../sections/experience-fields";
import { experiencesOf } from "../sections/experience-fields";
import type { IdentityFields } from "../sections/identity-fields";
import { identityFieldsOf } from "../sections/identity-fields";
import type { LanguageEntry } from "../sections/language-fields";
import { languagesOf } from "../sections/language-fields";

export type EditorFormValues = {
	identity: IdentityFields;
	experiences: ExperienceEntry[];
	education: EducationEntry[];
	languages: LanguageEntry[];
	customSections: CustomSection[];
	sectionOrder: SectionKey[];
};

export function editorFormValuesOf(content: CvContent): EditorFormValues {
	const customSections = customSectionsOf(content);
	return {
		identity: identityFieldsOf(content),
		experiences: experiencesOf(content),
		education: educationOf(content),
		languages: languagesOf(content),
		customSections,
		sectionOrder: completeSectionOrder(content, customSections),
	};
}

function recordOf(value: unknown): Record<string, unknown> | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return undefined;
	}
	return value as Record<string, unknown>;
}

function overlayEntries<T extends { id: string }>(
	previous: unknown,
	entries: T[],
	mapEntry: (
		base: Record<string, unknown>,
		entry: T,
	) => Record<string, unknown>,
): Record<string, unknown>[] {
	const byId = new Map<string, Record<string, unknown>>();
	if (Array.isArray(previous)) {
		for (const item of previous) {
			const record = recordOf(item);
			if (record && typeof record.id === "string") {
				byId.set(record.id, record);
			}
		}
	}
	return entries.map((entry) => mapEntry(byId.get(entry.id) ?? {}, entry));
}

/** Known fields overlay the stored objects so keys the editor does not edit survive a save. */
export function editorContentFromValues(
	content: CvContent,
	values: EditorFormValues,
): CvContent {
	return {
		...content,
		identity: { ...recordOf(content.identity), ...values.identity },
		experiences: overlayEntries(
			content.experiences,
			values.experiences,
			(base, entry) => ({
				...base,
				...entry,
				endMonth: entry.isCurrent ? "" : entry.endMonth,
			}),
		),
		education: overlayEntries(
			content.education,
			values.education,
			(base, entry) => ({
				...base,
				...entry,
			}),
		),
		languages: overlayEntries(
			content.languages,
			values.languages,
			(base, entry) => ({
				...base,
				...entry,
			}),
		),
		customSections: overlayEntries(
			content.customSections,
			values.customSections,
			(base, entry) => ({
				...base,
				...entry,
			}),
		),
		sectionOrder: [...values.sectionOrder],
	};
}

function completeSectionOrder(
	content: CvContent,
	customSections: { id: string }[],
): SectionKey[] {
	const customIds = new Set(customSections.map((section) => section.id));
	const result = sectionOrderOf(content).filter(
		(key) =>
			!isCustomSectionKey(key) || customIds.has(customSectionIdFromKey(key)),
	);
	for (const key of DEFAULT_SECTION_ORDER) {
		if (result.includes(key)) {
			continue;
		}
		let insertAt = 0;
		for (const earlier of DEFAULT_SECTION_ORDER) {
			if (earlier === key) {
				break;
			}
			const index = result.indexOf(earlier);
			if (index >= 0) {
				insertAt = index + 1;
			}
		}
		result.splice(insertAt, 0, key);
	}
	for (const section of customSections) {
		const key = customSectionKey(section.id);
		if (!result.includes(key)) {
			result.push(key);
		}
	}
	return result;
}
