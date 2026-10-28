import { z } from "zod";

import type { CvLocale } from "@/entities/cv";

/** Empty or `YYYY-MM` from `<input type="month">`. */
export const monthYearSchema = z.union([
	z.literal(""),
	z.string().regex(/^\d{4}-\d{2}$/),
]);

/** Current calendar month as `YYYY-MM` (for `<input type="month" max>`). */
export function currentMonthValue(now = new Date()): string {
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

/** Formats `YYYY-MM` for preview using the CV locale (`en` / `fr`). */
export function formatMonthYear(value: string, locale: CvLocale): string {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	if (!match) {
		return value;
	}
	const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		year: "numeric",
	}).format(date);
}

type MonthRangeFields = {
	startMonth: string;
	endMonth: string;
	isCurrent?: boolean;
};

/** True when both months are set and end is before start (skipped for current roles). */
export function isMonthRangeOrderedInvalid(entry: MonthRangeFields): boolean {
	if (entry.isCurrent) {
		return false;
	}
	if (!entry.startMonth || !entry.endMonth) {
		return false;
	}
	return entry.startMonth > entry.endMonth;
}

/** Returns `messageKey` when end is before start; otherwise null. */
export function monthRangeError<T extends string>(
	entry: MonthRangeFields,
	messageKey: T,
): T | null {
	return isMonthRangeOrderedInvalid(entry) ? messageKey : null;
}

export function entriesHaveValidMonthRanges(
	entries: MonthRangeFields[],
): boolean {
	return entries.every((entry) => {
		if (!monthYearSchema.safeParse(entry.startMonth).success) {
			return false;
		}
		if (!monthYearSchema.safeParse(entry.endMonth).success) {
			return false;
		}
		return !isMonthRangeOrderedInvalid(entry);
	});
}

type MonthDateRangeLabelOptions = {
	locale: CvLocale;
	/** Present/Présent already resolved for the CV locale. */
	presentLabel?: string;
};

/** Preview date range; month names follow the CV locale. */
export function monthDateRangeLabel(
	entry: MonthRangeFields,
	{ locale, presentLabel }: MonthDateRangeLabelOptions,
): string {
	const start = entry.startMonth
		? formatMonthYear(entry.startMonth, locale)
		: "";
	const end =
		entry.isCurrent && presentLabel
			? presentLabel
			: entry.endMonth
				? formatMonthYear(entry.endMonth, locale)
				: "";
	if (start && end) {
		return `${start} – ${end}`;
	}
	return start || end;
}
