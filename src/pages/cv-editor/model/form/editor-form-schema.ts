import type { z } from "zod";

import { cvContentSchema } from "@/entities/cv";

const MONTH = /^\d{4}-\d{2}$/;

function addMonthFormatIssue(
	value: string,
	ctx: z.RefinementCtx,
	path: (string | number)[],
) {
	if (value === "" || MONTH.test(value)) {
		return;
	}
	ctx.addIssue({
		code: "custom",
		message: "cvEditor.month.invalid",
		path,
	});
}

function addUnorderedMonthIssues(
	entry: { startMonth: string; endMonth: string; isCurrent?: boolean },
	ctx: z.RefinementCtx,
	message: string,
	pathPrefix: (string | number)[],
) {
	if (entry.isCurrent) {
		return;
	}
	if (!MONTH.test(entry.startMonth) || !MONTH.test(entry.endMonth)) {
		return;
	}
	if (entry.startMonth <= entry.endMonth) {
		return;
	}
	ctx.addIssue({
		code: "custom",
		message,
		path: [...pathPrefix, "startMonth"],
	});
	ctx.addIssue({
		code: "custom",
		message,
		path: [...pathPrefix, "endMonth"],
	});
}

/** CV content schema plus editor month format / range messages. */
export const editorFormSchema = cvContentSchema.superRefine((content, ctx) => {
	for (const [index, entry] of content.experiences.entries()) {
		const path = ["experiences", index] as const;
		addMonthFormatIssue(entry.startMonth, ctx, [...path, "startMonth"]);
		addMonthFormatIssue(entry.endMonth, ctx, [...path, "endMonth"]);
		addUnorderedMonthIssues(
			entry,
			ctx,
			"cvEditor.experiences.errors.endBeforeStart",
			[...path],
		);
	}
	for (const [index, entry] of content.education.entries()) {
		const path = ["education", index] as const;
		addMonthFormatIssue(entry.startMonth, ctx, [...path, "startMonth"]);
		addMonthFormatIssue(entry.endMonth, ctx, [...path, "endMonth"]);
		addUnorderedMonthIssues(
			entry,
			ctx,
			"cvEditor.education.errors.endBeforeStart",
			[...path],
		);
	}
});
