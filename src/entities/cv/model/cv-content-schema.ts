import { z } from "zod";

import {
	customSectionIdFromKey,
	DEFAULT_SECTION_ORDER,
	isCustomSectionKey,
	type SectionKey,
} from "./cv";

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

const experienceSchema = z.object({
	id: z.string().min(1),
	jobTitle: z.string(),
	company: z.string(),
	location: z.string(),
	startMonth: z.string(),
	endMonth: z.string(),
	isCurrent: z.boolean(),
	description: z.string(),
});

const educationSchema = z.object({
	id: z.string().min(1),
	school: z.string(),
	degree: z.string(),
	location: z.string(),
	startMonth: z.string(),
	endMonth: z.string(),
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

/** Shape of persisted / exported CV content (section order invariants included). */
export const cvContentSchema = z
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
