import { z } from "zod";

import type { SectionKey } from "@/entities/cv";
import {
	customSectionIdFromKey,
	DEFAULT_SECTION_ORDER,
	isCustomSectionKey,
} from "@/entities/cv";

const editorMonthSchema = z.union([
	z.literal(""),
	z.string().regex(/^\d{4}-\d{2}$/, { error: "cvEditor.month.invalid" }),
]);

const identitySchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	jobTitle: z.string(),
	email: z.string(),
	phone: z.string(),
	postalCode: z.string(),
	linkedin: z.string(),
	github: z.string(),
	website: z.string(),
	description: z.string(),
});

function addUnorderedMonthIssues(
	entry: { startMonth: string; endMonth: string; isCurrent?: boolean },
	ctx: z.RefinementCtx,
	message: string,
) {
	if (entry.isCurrent) {
		return;
	}
	if (
		!/^\d{4}-\d{2}$/.test(entry.startMonth) ||
		!/^\d{4}-\d{2}$/.test(entry.endMonth)
	) {
		return;
	}
	if (entry.startMonth <= entry.endMonth) {
		return;
	}
	ctx.addIssue({ code: "custom", message, path: ["startMonth"] });
	ctx.addIssue({ code: "custom", message, path: ["endMonth"] });
}

const experienceSchema = z
	.object({
		id: z.string().min(1),
		jobTitle: z.string(),
		company: z.string(),
		location: z.string(),
		startMonth: editorMonthSchema,
		endMonth: editorMonthSchema,
		isCurrent: z.boolean(),
		description: z.string(),
	})
	.superRefine((entry, ctx) => {
		addUnorderedMonthIssues(
			entry,
			ctx,
			"cvEditor.experiences.errors.endBeforeStart",
		);
	});

const educationSchema = z
	.object({
		id: z.string().min(1),
		school: z.string(),
		degree: z.string(),
		location: z.string(),
		startMonth: editorMonthSchema,
		endMonth: editorMonthSchema,
	})
	.superRefine((entry, ctx) => {
		addUnorderedMonthIssues(
			entry,
			ctx,
			"cvEditor.education.errors.endBeforeStart",
		);
	});

const languageSchema = z.object({
	id: z.string().min(1),
	language: z.string(),
	level: z.string(),
});

const customSectionSchema = z.object({
	id: z.string().min(1),
	title: z.string(),
	description: z.string(),
});

const builtinSectionKeySchema = z.enum(DEFAULT_SECTION_ORDER);

const sectionKeySchema = z.custom<SectionKey>(
	(value) =>
		typeof value === "string" &&
		(builtinSectionKeySchema.safeParse(value).success ||
			isCustomSectionKey(value)),
);

export const editorFormSchema = z
	.object({
		identity: identitySchema,
		experiences: z.array(experienceSchema),
		education: z.array(educationSchema),
		languages: z.array(languageSchema),
		customSections: z.array(customSectionSchema),
		sectionOrder: z.array(sectionKeySchema).min(1),
	})
	.superRefine((content, ctx) => {
		const { sectionOrder, customSections } = content;
		if (sectionOrder[0] !== "identity") {
			ctx.addIssue({
				code: "custom",
				message: "sectionOrder must start with identity",
				path: ["sectionOrder"],
			});
		}
		for (const key of DEFAULT_SECTION_ORDER) {
			if (!sectionOrder.includes(key)) {
				ctx.addIssue({
					code: "custom",
					message: `sectionOrder missing ${key}`,
					path: ["sectionOrder"],
				});
			}
		}
		const customIds = new Set(customSections.map((section) => section.id));
		for (const key of sectionOrder) {
			if (!isCustomSectionKey(key)) {
				continue;
			}
			if (!customIds.has(customSectionIdFromKey(key))) {
				ctx.addIssue({
					code: "custom",
					message: `sectionOrder references missing custom section ${key}`,
					path: ["sectionOrder"],
				});
			}
		}
	});
