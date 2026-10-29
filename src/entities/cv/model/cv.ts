import { z } from "zod";

import { APP_LOCALES, type AppLocale } from "@/shared/i18n";

export type CvContent = Record<string, unknown>;

export const cvLocaleSchema = z.enum(APP_LOCALES);

export type CvLocale = AppLocale;

export const DEFAULT_SECTION_ORDER = [
	"identity",
	"experiences",
	"education",
	"languages",
] as const;

export type BuiltinSectionKey = (typeof DEFAULT_SECTION_ORDER)[number];

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

function isBuiltinSectionKey(value: string): value is BuiltinSectionKey {
	return BUILTIN_KEYS.has(value);
}

function isSectionKey(value: unknown): value is SectionKey {
	return (
		typeof value === "string" &&
		(isBuiltinSectionKey(value) || isCustomSectionKey(value))
	);
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

export function sectionOrderOf(content: CvContent): SectionKey[] {
	const order = content.sectionOrder;
	if (
		Array.isArray(order) &&
		order[0] === "identity" &&
		order.every(isSectionKey)
	) {
		return order;
	}

	return [
		...DEFAULT_SECTION_ORDER,
		...customSectionIdsOf(content).map(customSectionKey),
	];
}
