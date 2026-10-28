import { z } from "zod";

import { APP_LOCALES, type AppLocale } from "@/shared/i18n";

/** CV content payload; section shapes fill in on later tickets. */
export type CvContent = Record<string, unknown>;

/** Same codes as UI i18n (`APP_LOCALES`). */
export const cvLocaleSchema = z.enum(APP_LOCALES);

export type CvLocale = AppLocale;

/** Built-in top-level sections. Identity is always first; others reorder later. */
export const DEFAULT_SECTION_ORDER = [
	"identity",
	"experiences",
	"education",
	"languages",
] as const;

export type BuiltinSectionKey = (typeof DEFAULT_SECTION_ORDER)[number];

/** One order slot per custom section: `custom:<uuid>`. */
export type CustomSectionOrderKey = `custom:${string}`;

export type SectionKey = BuiltinSectionKey | CustomSectionOrderKey;

export type Cv = {
	id: string;
	title: string;
	locale: CvLocale;
	content: CvContent;
	createdAt: number;
	updatedAt: number;
};

export const createCvInputSchema = z.object({
	title: z.string().trim().min(1, "createCv.titleRequired"),
	locale: cvLocaleSchema,
});

export type CreateCvInput = z.infer<typeof createCvInputSchema>;

export function createEmptyCvContent(): CvContent {
	return {
		identity: {},
		experiences: [],
		education: [],
		languages: [],
		customSections: [],
		sectionOrder: [...DEFAULT_SECTION_ORDER],
	};
}

const BUILTIN_KEYS = new Set<string>(DEFAULT_SECTION_ORDER);

export function isCustomSectionKey(
	value: string,
): value is CustomSectionOrderKey {
	return value.startsWith("custom:") && value.length > "custom:".length;
}

export function customSectionKey(id: string): CustomSectionOrderKey {
	return `custom:${id}`;
}

export function customSectionIdFromKey(key: CustomSectionOrderKey): string {
	return key.slice("custom:".length);
}

function customSectionIdsOf(content: CvContent): string[] {
	const raw = content.customSections;
	if (!Array.isArray(raw)) {
		return [];
	}
	const ids: string[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object" || Array.isArray(item)) {
			continue;
		}
		const id = (item as { id?: unknown }).id;
		if (typeof id === "string" && id.length > 0) {
			ids.push(id);
		}
	}
	return ids;
}

function isBuiltinSectionKey(value: string): value is BuiltinSectionKey {
	return BUILTIN_KEYS.has(value);
}

/**
 * Reads persisted section order. Identity stays first; legacy `"customs"` is
 * dropped; each `customSections` id gets a `custom:<id>` slot.
 */
export function sectionOrderOf(content: CvContent): SectionKey[] {
	const customIds = customSectionIdsOf(content);
	const customIdSet = new Set(customIds);
	const persisted = Array.isArray(content.sectionOrder)
		? content.sectionOrder
		: [];

	const result: SectionKey[] = ["identity"];
	const seen = new Set<string>(["identity"]);

	for (const entry of persisted) {
		if (typeof entry !== "string") {
			continue;
		}
		if (entry === "identity" || entry === "customs" || seen.has(entry)) {
			continue;
		}
		if (isBuiltinSectionKey(entry)) {
			result.push(entry);
			seen.add(entry);
			continue;
		}
		if (isCustomSectionKey(entry)) {
			const id = customSectionIdFromKey(entry);
			if (customIdSet.has(id)) {
				result.push(entry);
				seen.add(entry);
			}
		}
	}

	for (const key of DEFAULT_SECTION_ORDER) {
		if (key === "identity" || seen.has(key)) {
			continue;
		}
		result.push(key);
		seen.add(key);
	}

	for (const id of customIds) {
		const key = customSectionKey(id);
		if (seen.has(key)) {
			continue;
		}
		result.push(key);
		seen.add(key);
	}

	return result;
}
